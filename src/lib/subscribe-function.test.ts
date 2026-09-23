/**
 * /api/subscribe is its own Netlify function with its own rate limit (DECISIONS N18, N35),
 * because the rest of the app is one function at "/*" and a limit applies only through the
 * config of the function that declares it. This checks the function's route and limit, that
 * it only connects the host-agnostic handleSubscribe, and that no app route also answers
 * /api/subscribe (which would reach the same URL without the limit).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import subscribeFunction, { config } from "../../netlify/functions/subscribe.mts";
import { SUBSCRIBE_PATH } from "./subscribe-client.ts";

describe("the /api/subscribe Netlify function", () => {
  it("serves the path the form posts to", () => {
    assert.equal(config.path, SUBSCRIBE_PATH);
  });

  it("has its own rate limit: 5 requests per minute, counted per IP (N35)", () => {
    assert.deepEqual(config.rateLimit, {
      windowLimit: 5,
      windowSize: 60,
      aggregateBy: ["ip", "domain"],
    });
  });

  it("only connects handleSubscribe: without the Resend settings it answers like the handler, 404", async () => {
    const names = ["RESEND_API_KEY", "SUBSCRIBE_NOTIFY_TO", "SUBSCRIBE_FROM"];
    const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
    for (const name of names) delete process.env[name];
    try {
      const response = await subscribeFunction(new Request(`https://peso.credit${SUBSCRIBE_PATH}`));
      assert.equal(response.status, 404);
      assert.deepEqual(await response.json(), { ok: false, error: "unavailable" });
    } finally {
      for (const [name, value] of Object.entries(saved)) if (value !== undefined) process.env[name] = value;
    }
  });

  it("no app route answers /api/subscribe without the limit", () => {
    assert.ok(!existsSync(new URL("../routes/api/subscribe.ts", import.meta.url)), "src/routes/api/subscribe.ts is back");
    const routeTree = readFileSync(new URL("../routeTree.gen.ts", import.meta.url), "utf8");
    assert.ok(!routeTree.includes(`'${SUBSCRIBE_PATH}'`), "routeTree.gen.ts still has /api/subscribe");
  });
});
