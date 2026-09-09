const { chromium } = require("playwright");
const BASE = "http://localhost:4173";
const SESSION_ID = "11111111-1111-1111-1111-111111111111";
const TOPICS = [
  { id: 1, name: "History" },
  { id: 2, name: "Movies" },
  { id: 3, name: "Football" },
  { id: 4, name: "Science" },
];
const PLAYERS = [{ id: 101, name: "Youssef" }, { id: 102, name: "Nour" }];
const SESSION = { id: SESSION_ID, status: "in_progress", created_at: new Date().toISOString(), topics: TOPICS, players: PLAYERS };

function buildQuestions() {
  const diffs = [100, 300, 500];
  const items = [];
  let i = 0;
  for (const topic of TOPICS) {
    for (const diff of diffs) {
      for (const player of PLAYERS) {
        i++;
        let state = "locked";
        if (i % 7 === 0) state = "opened";
        else if (i % 5 === 0) state = "judged";
        items.push({ id: `q-${i}`, topic: topic.name, difficulity: diff, player: player.name, state,
          text: state === "locked" ? null : `Sample ${topic.name} question worth ${diff}?`, media: null });
      }
    }
  }
  return items;
}
const QUESTIONS = buildQuestions();
const SCOREBOARD = [{ player_id: 101, player_name: "Youssef", score: 400 }, { player_id: 102, player_name: "Nour", score: 300 }];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(() => {
    localStorage.setItem("qahwa-auth", JSON.stringify({ state: { accessToken: "x", refreshToken: "x", username: "mohamed", isAuthenticated: true }, version: 0 }));
  });
  await page.route("**/api/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/api/sessions/current/")) return route.fulfill({ json: SESSION });
    if (url.includes(`/questions/`)) return route.fulfill({ json: QUESTIONS });
    if (url.includes(`/scoreboard/`)) return route.fulfill({ json: SCOREBOARD });
    return route.fulfill({ json: {} });
  });

  await page.goto(`${BASE}/games/${SESSION_ID}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "/home/claude/work/shots/gallery-01-board.png", fullPage: true });

  await page.getByRole("button", { name: /History/ }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/home/claude/work/shots/gallery-02-topic-modal.png" });

  await browser.close();
})();
