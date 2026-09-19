const test = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { app } = require("../index");

async function withServer(callback) {
  const server = app.listen(0);
  await once(server, "listening");
  try {
    return await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("health endpoint reports service availability", () => withServer(async (baseUrl) => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
}));

test("weather brief validates input before making an external request", () => withServer(async (baseUrl) => {
  const response = await fetch(`${baseUrl}/api/weather-briefs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city: "", units: "metric" })
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /city must be a non-empty string/);
}));

test("unknown routes return a JSON 404", () => withServer(async (baseUrl) => {
  const response = await fetch(`${baseUrl}/api/missing`);
  assert.equal(response.status, 404);
  assert.match((await response.json()).error, /was not found/);
}));