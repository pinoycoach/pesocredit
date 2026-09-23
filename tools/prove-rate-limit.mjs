#!/usr/bin/env node
/**
 * Proves, on a live Netlify site, that POST /api/subscribe has its own rate limit (DECISIONS N18,
 * N35; BUILD-STANDARD point 12: the live site, not the docs, is ground truth).
 *
 *   node tools/prove-rate-limit.mjs https://<site>.netlify.app
 *
 * It sends only the body {} with the site's own Origin. /api/subscribe refuses that before any
 * call to Resend (404 "unavailable" without the Resend settings, 400 "invalid" with them), so
 * the script can never send an email. It checks:
 *   1. The dedicated function answers /api/subscribe (JSON), not the whole-app "/*" function (HTML).
 *   2. Repeated requests get 429. Netlify may take up to 10 s to start blocking, so it sends a
 *      burst, waits 11 s, then sends another.
 *   3. While /api/subscribe is blocked, the page itself still answers 200.
 *   4. The function's default address, /.netlify/functions/subscribe, is not an unlimited way in.
 * Exit code 0 only if all four pass. Record the output in DECISIONS N18.
 */
const site = process.argv[2];
// https for a live site; plain http only for this machine (netlify dev, which does not emulate
// rate limits, so check 2 is expected to fail there).
if (!site || !/^(https:\/\/[^/]+|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/.test(site.replace(/\/$/, ""))) {
  console.error("usage: node tools/prove-rate-limit.mjs https://<site>.netlify.app");
  process.exit(2);
}
const origin = site.replace(/\/$/, "");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** One POST of {} with this site's Origin; what came back, and who answered. */
async function post(path) {
  const res = await fetch(origin + path, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: "{}",
    redirect: "manual",
  });
  const type = res.headers.get("content-type") ?? "";
  const text = await res.text();
  let ours = false;
  if (type.includes("application/json")) {
    try {
      const body = JSON.parse(text);
      ours = body.ok === false && ["unavailable", "invalid"].includes(body.error);
    } catch {
      // not our JSON
    }
  }
  return { status: res.status, ours, type: type.split(";")[0] || "(none)" };
}

const show = (r) => `${r.status}${r.status === 429 ? "" : r.ours ? " ours" : ` ${r.type}`}`;
const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}: ${detail}`);
};

// 1 and 2: the limit on /api/subscribe.
const burst1 = [];
for (let i = 0; i < 6; i++) burst1.push(await post("/api/subscribe"));
await sleep(11_000);
const burst2 = [];
for (let i = 0; i < 3; i++) burst2.push(await post("/api/subscribe"));
const all = [...burst1, ...burst2];
console.log(`/api/subscribe: ${burst1.map(show).join(", ")} | after 11 s: ${burst2.map(show).join(", ")}`);

const answered = all.filter((r) => r.status !== 429);
check(
  "the dedicated function answers /api/subscribe",
  answered.length > 0 && answered.every((r) => r.ours),
  answered.every((r) => r.ours) ? "every non-429 answer is its JSON" : "an answer was not its JSON (the whole-app function?)",
);
check("/api/subscribe is rate limited", all.some((r) => r.status === 429), `${all.filter((r) => r.status === 429).length} of ${all.length} got 429`);

// 3: the page is not limited while /api/subscribe is.
const page = await fetch(origin + "/", { redirect: "manual" });
check("the page still answers while /api/subscribe is blocked", page.status === 200, `GET / -> ${page.status}`);

// 4: the function's default address.
const direct = [];
for (let i = 0; i < 8; i++) direct.push(await post("/.netlify/functions/subscribe"));
const unlimited = direct.every((r) => r.ours);
check(
  "/.netlify/functions/subscribe is not an unlimited way in",
  !unlimited,
  `${direct.map(show).join(", ")}${unlimited ? " (reachable and never limited: a bypass)" : ""}`,
);

const failed = results.filter((r) => !r.pass).length;
console.log(failed === 0 ? `\nAll ${results.length} checks passed on ${origin}.` : `\n${failed} of ${results.length} checks FAILED on ${origin}.`);
process.exit(failed === 0 ? 0 : 1);
