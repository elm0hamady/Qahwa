const { chromium } = require("playwright");
const BASE = "http://localhost:4173";
const SESSION_ID = "11111111-1111-1111-1111-111111111111";
const SESSION = { id: SESSION_ID, status: "in_progress", created_at: new Date().toISOString(),
  topics: [{id:1,name:"History"}], players: [{id:101,name:"Youssef"},{id:102,name:"Nour"}] };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  page.on("console", (msg) => { if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text()); });
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));
  page.on("dialog", async (dialog) => {
    console.log("DIALOG:", dialog.type(), dialog.message());
    await dialog.accept();
  });

  await page.addInitScript(() => {
    localStorage.setItem("qahwa-auth", JSON.stringify({ state: { accessToken: "x", refreshToken: "x", username: "mohamed", isAuthenticated: true }, version: 0 }));
  });

  let deleteWasCalled = false;
  await page.route("**/api/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    if (url.includes("/api/sessions/current/") && method === "GET") {
      return route.fulfill({ json: deleteWasCalled ? { session: null } : SESSION });
    }
    if (url.includes("/api/sessions/current/") && method === "DELETE") {
      deleteWasCalled = true;
      console.log("DELETE /sessions/current/ was called");
      return route.fulfill({ status: 204, body: "" });
    }
    if (url.includes("/questions/")) return route.fulfill({ json: [] });
    if (url.includes("/scoreboard/")) return route.fulfill({ json: [] });
    return route.fulfill({ json: {} });
  });

  await page.goto(`${BASE}/games/${SESSION_ID}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  console.log("URL before click:", page.url());

  await page.getByRole("button", { name: "Abandon game" }).click();
  await page.waitForTimeout(1000);

  console.log("deleteWasCalled:", deleteWasCalled);
  console.log("URL after click:", page.url());

  await browser.close();
})();
