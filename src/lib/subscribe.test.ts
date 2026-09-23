import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  FORWARD_TIMEOUT_MS,
  handleSubscribe,
  isValidEmail,
  MAX_BODY_BYTES,
  NOTIFY_SUBJECT,
  parseSubscribeBody,
  readResendSettings,
  RESEND_EMAILS_URL,
  type SubscribeEnv,
} from "./subscribe.ts";

const ENV: SubscribeEnv = {
  RESEND_API_KEY: "re_test_secret-123",
  SUBSCRIBE_NOTIFY_TO: "owner@inbox.example",
  SUBSCRIBE_FROM: "peso.credit <subscribe@peso.credit>",
};
const NOW = new Date("2026-09-19T08:30:00.000Z");

type Call = { url: string; init: RequestInit };

function fakeFetch(respond: () => Response | Promise<Response> = () => new Response("ok")) {
  const calls: Call[] = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return respond();
  }) as typeof fetch;
  return { impl, calls };
}

function post(body: unknown, headers: Record<string, string> = {}, raw?: string): Request {
  return new Request("http://app.test/api/subscribe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://app.test",
      ...headers,
    },
    body: raw ?? JSON.stringify(body),
  });
}

const good = { email: "ana@example.com", consent: true };

async function run(request: Request, env: SubscribeEnv = ENV) {
  const f = fakeFetch();
  const response = await handleSubscribe(request, { env, fetchImpl: f.impl, now: () => NOW });
  return { response, calls: f.calls, text: await response.clone().text() };
}

describe("the Resend settings", () => {
  it("are usable with a Resend key, an inbox and a sender on the domain", () => {
    assert.deepEqual(readResendSettings(ENV), {
      apiKey: "re_test_secret-123",
      notifyTo: "owner@inbox.example",
      from: "peso.credit <subscribe@peso.credit>",
    });
    assert.ok(readResendSettings({ ...ENV, SUBSCRIBE_FROM: " subscribe@peso.credit " }), "a bare sender address");
  });

  it("switch the form off unless all three are usable", () => {
    for (const over of [
      { RESEND_API_KEY: undefined },
      { RESEND_API_KEY: "" },
      { RESEND_API_KEY: "sk_live_123" },
      { RESEND_API_KEY: "re_ has space" },
      { SUBSCRIBE_NOTIFY_TO: undefined },
      { SUBSCRIBE_NOTIFY_TO: "not an address" },
      { SUBSCRIBE_FROM: undefined },
      { SUBSCRIBE_FROM: "peso.credit" },
      { SUBSCRIBE_FROM: "peso.credit <subscribe@peso.credit>\nBcc: x@evil.example" },
      { SUBSCRIBE_FROM: "<subscribe@peso.credit" },
    ]) {
      assert.equal(readResendSettings({ ...ENV, ...over }), null, JSON.stringify(over));
    }
  });
});

describe("email addresses", () => {
  it("accepts ordinary addresses", () => {
    for (const email of ["ana@example.com", "a.b+c@sub.example.co.ph", "x@y.io"]) {
      assert.ok(isValidEmail(email), email);
    }
  });

  it("refuses things that are not addresses", () => {
    const tooLong = `${"a".repeat(250)}@x.co`;
    for (const email of ["", "a", "a@b", "a@.com", "a@b..c", "@x.com", "a b@x.com", "a@x.com\n", "a@@x.com", "a\u0000@x.com", tooLong]) {
      assert.equal(isValidEmail(email), false, JSON.stringify(email).slice(0, 40));
    }
  });
});

describe("the request body", () => {
  it("accepts exactly { email, consent: true } and trims the address", () => {
    assert.deepEqual(parseSubscribeBody({ email: "  ana@example.com ", consent: true }), {
      ok: true,
      email: "ana@example.com",
    });
  });

  it("refuses any extra field, including anything shaped like a loan number", () => {
    for (const extra of [
      { principal: 5000 },
      { payment: "6500" },
      { loan: { principal: 5000, payment: 6500 } },
      { consentedAt: "2026-01-01T00:00:00.000Z" },
      { note: "" },
    ]) {
      assert.deepEqual(parseSubscribeBody({ ...good, ...extra }), { ok: false }, JSON.stringify(extra));
    }
  });

  it("refuses missing fields, wrong types and consent that is not literally true", () => {
    for (const bad of [
      { email: "ana@example.com" },
      { consent: true },
      { email: "ana@example.com", consent: false },
      { email: "ana@example.com", consent: "true" },
      { email: "ana@example.com", consent: 1 },
      { email: 42, consent: true },
      null,
      [],
      "ana@example.com",
      42,
    ]) {
      assert.deepEqual(parseSubscribeBody(bad), { ok: false }, JSON.stringify(bad));
    }
  });
});

describe("POST /api/subscribe", () => {
  let logged: string[];
  const original = { ...console };
  beforeEach(() => {
    logged = [];
    for (const level of ["log", "info", "warn", "error", "debug"] as const) {
      console[level] = (...args: unknown[]) => void logged.push(args.map(String).join(" "));
    }
  });
  afterEach(() => Object.assign(console, original));

  it("emails the owner's inbox through Resend: the address and the server's time, nothing else", async () => {
    const { response, calls, text } = await run(post(good));
    assert.equal(response.status, 200);
    assert.deepEqual(JSON.parse(text), { ok: true });

    assert.equal(calls.length, 1);
    const [call] = calls;
    assert.equal(call.url, RESEND_EMAILS_URL);
    assert.equal(RESEND_EMAILS_URL, "https://api.resend.com/emails");
    assert.equal(call.init.method, "POST");
    assert.equal(call.init.redirect, "error");
    assert.ok(call.init.signal, "a timeout is set");
    assert.equal(FORWARD_TIMEOUT_MS, 8_000);
    const headers = call.init.headers as Record<string, string>;
    assert.equal(headers.authorization, "Bearer re_test_secret-123");
    assert.equal(headers["content-type"], "application/json");

    const sent = JSON.parse(String(call.init.body));
    assert.deepEqual(sent, {
      from: "peso.credit <subscribe@peso.credit>",
      to: ["owner@inbox.example"],
      subject: NOTIFY_SUBJECT,
      text: "Email: ana@example.com\nConsented at: 2026-09-19T08:30:00.000Z\n",
    });
  });

  it("refuses a body with a loan number in it, and forwards nothing", async () => {
    const { response, calls } = await run(post({ ...good, principal: 5000, payment: 6500 }));
    assert.equal(response.status, 400);
    assert.equal(calls.length, 0);
  });

  it("refuses a browser-supplied timestamp: only the server stamps the time", async () => {
    const { response, calls } = await run(post({ ...good, consentedAt: "1999-01-01T00:00:00.000Z" }));
    assert.equal(response.status, 400);
    assert.equal(calls.length, 0);
  });

  it("refuses bad input with the right status", async () => {
    const cases: [string, Request, number][] = [
      ["no consent", post({ email: "ana@example.com", consent: false }), 400],
      ["bad address", post({ email: "nope", consent: true }), 400],
      ["not json", post(undefined, {}, "{oops"), 400],
      ["an array", post([good]), 400],
      ["wrong content type", post(good, { "content-type": "text/plain" }), 415],
      ["too large", post({ ...good, pad: "x".repeat(MAX_BODY_BYTES) }), 413],
      ["a GET", new Request("http://app.test/api/subscribe", { method: "GET" }), 405],
    ];
    for (const [name, request, status] of cases) {
      const { response, calls } = await run(request);
      assert.equal(response.status, status, name);
      assert.equal(calls.length, 0, name);
    }
  });

  it("only accepts posts from its own pages", async () => {
    const ok: Record<string, string>[] = [
      { "sec-fetch-site": "same-origin" },
      { origin: "http://app.test" },
    ];
    for (const headers of ok) {
      assert.equal((await run(post(good, headers))).response.status, 200, JSON.stringify(headers));
    }
    const refused: Record<string, string>[] = [
      { origin: "http://evil.example" },
      { "sec-fetch-site": "cross-site" },
      { "sec-fetch-site": "same-site" },
      { "sec-fetch-site": "none" },
    ];
    for (const headers of refused) {
      const { response, calls } = await run(post(good, headers));
      assert.equal(response.status, 403, JSON.stringify(headers));
      assert.equal(calls.length, 0);
    }
    const noHeaders = new Request("http://app.test/api/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(good),
    });
    assert.equal((await run(noHeaders)).response.status, 403, "neither Origin nor Sec-Fetch-Site");
  });

  it("does not exist when the Resend settings are missing or not usable", async () => {
    for (const env of [{}, { ...ENV, RESEND_API_KEY: "" }, { ...ENV, SUBSCRIBE_NOTIFY_TO: "nope" }, { ...ENV, SUBSCRIBE_FROM: undefined }]) {
      const { response, calls } = await run(post(good), env);
      assert.equal(response.status, 404, JSON.stringify(env));
      assert.equal(calls.length, 0);
    }
  });

  it("answers 502, with no detail, when Resend fails", async () => {
    for (const respond of [() => new Response("boom", { status: 500 }), () => new Response("no", { status: 403 })]) {
      const f = fakeFetch(respond);
      const response = await handleSubscribe(post(good), { env: ENV, fetchImpl: f.impl, now: () => NOW });
      assert.equal(response.status, 502);
      assert.deepEqual(await response.json(), { ok: false, error: "unavailable" });
    }
    const throwing = (async () => {
      throw new Error("connect ECONNREFUSED api.resend.com");
    }) as typeof fetch;
    const response = await handleSubscribe(post(good), { env: ENV, fetchImpl: throwing });
    assert.equal(response.status, 502);
    assert.ok(!(await response.text()).includes("ECONNREFUSED"));
  });

  it("never puts the email, the key or the inbox in a response, and logs nothing", async () => {
    const outcomes = [
      await run(post(good)),
      await run(post({ ...good, principal: 1 })),
      await run(post(good, { origin: "http://evil.example" })),
      await run(post(good), {}),
    ];
    for (const { text } of outcomes) {
      assert.ok(!text.includes("ana@example.com"), text);
      assert.ok(!text.includes("secret-123"), text);
      assert.ok(!text.includes("owner@inbox.example"), text);
    }
    assert.deepEqual(logged, [], "nothing about a request may be logged");
  });
});
