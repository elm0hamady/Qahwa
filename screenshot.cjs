const { chromium } = require("playwright");

const BASE = "http://localhost:4173";
const SESSION_ID = "11111111-1111-1111-1111-111111111111";

const TOPICS = [
  { id: 1, name: "History", category: "Humanities" },
  { id: 2, name: "Movies", category: "Entertainment" },
  { id: 3, name: "Football", category: "Sports" },
  { id: 4, name: "Science", category: "STEM" },
];

const PLAYERS = [
  { id: 101, name: "Youssef" },
  { id: 102, name: "Nour" },
];

const SESSION = {
  id: SESSION_ID,
  status: "in_progress",
  created_at: new Date().toISOString(),
  topics: TOPICS.map((t) => ({ id: t.id, name: t.name })),
  players: PLAYERS,
};

function buildQuestions() {
  const diffs = [100, 300, 500];
  const items = [];
  let i = 0;
  for (const topic of TOPICS) {
    for (const diff of diffs) {
      for (const player of PLAYERS) {
        i++;
        // Vary states so the board looks alive: mostly locked, a handful opened/judged.
        let state = "locked";
        if (i % 7 === 0) state = "opened";
        else if (i % 5 === 0) state = "judged";

        items.push({
          id: `q-${i}`,
          topic: topic.name,
          difficulity: diff,
          player: player.name,
          state,
          text: state === "locked" ? null : `Sample ${topic.name.toLowerCase()} question worth ${diff} points?`,
          media: null,
        });
      }
    }
  }
  return items;
}

const QUESTIONS = buildQuestions();
const SCOREBOARD = [
  { player_id: 101, player_name: "Youssef", score: 800 },
  { player_id: 102, player_name: "Nour", score: 600 },
];

const TOPICS_PAGE = {
  count: TOPICS.length,
  next: null,
  previous: null,
  results: TOPICS,
};

async function mockApi(page) {
  await page.route("**/api/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/api/sessions/current/")) {
      return route.fulfill({ json: SESSION });
    }
    if (url.includes(`/api/sessions/${SESSION_ID}/questions/`)) {
      return route.fulfill({ json: QUESTIONS });
    }
    if (url.includes(`/api/sessions/${SESSION_ID}/scoreboard/`)) {
      return route.fulfill({ json: SCOREBOARD });
    }
    if (url.includes("/api/topics/")) {
      return route.fulfill({ json: TOPICS_PAGE });
    }
    return route.fulfill({ json: {} });
  });
}

async function setAuth(page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "qahwa-auth",
      JSON.stringify({
        state: {
          accessToken: "fake-access-token",
          refreshToken: "fake-refresh-token",
          username: "mohamed",
          isAuthenticated: true,
        },
        version: 0,
      })
    );
  });
}

async function shoot(page, path, filename, { auth = false, wait = 600 } = {}) {
  if (auth) await setAuth(page);
  await mockApi(page);
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(wait);

  // Walk the page in viewport-sized steps so every scroll-triggered
  // (whileInView) animation actually fires before the full-page capture,
  // instead of relying on the instant viewport expansion fullPage does.
  const viewportHeight = page.viewportSize()?.height ?? 900;
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < scrollHeight; y += viewportHeight) {
    await page.evaluate((yPos) => window.scrollTo(0, yPos), y);
    await page.waitForTimeout(220);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);

  await page.screenshot({ path: `/home/claude/work/shots/${filename}`, fullPage: true });
  console.log("captured", filename);
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await shoot(page, "/", "01-landing.png");
  await shoot(page, "/login", "02-login.png");
  await shoot(page, "/dashboard", "03-dashboard.png", { auth: true });
  await shoot(page, "/games/new", "04-new-game.png", { auth: true });
  await shoot(page, `/games/${SESSION_ID}`, "05-game-board.png", { auth: true });
  await shoot(page, `/games/${SESSION_ID}/results`, "06-results.png", { auth: true });
  await shoot(page, "/this-page-does-not-exist", "07-404.png");

  // mobile shot of landing
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mockApi(mobilePage);
  await mobilePage.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(600);
  const mobileScrollHeight = await mobilePage.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < mobileScrollHeight; y += 844) {
    await mobilePage.evaluate((yPos) => window.scrollTo(0, yPos), y);
    await mobilePage.waitForTimeout(220);
  }
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(200);
  await mobilePage.screenshot({ path: "/home/claude/work/shots/08-landing-mobile.png", fullPage: true });
  console.log("captured 08-landing-mobile.png");

  await browser.close();
})();
