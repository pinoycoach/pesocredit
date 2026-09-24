#!/usr/bin/env node
/**
 * Checks, on a live site, what the privacy page's P08 says: the site sets no cookies and loads
 * nothing from other websites (DECISIONS N45; BUILD-STANDARD point 12: the live site, not the
 * code, is ground truth).
 *
 *   node tools/check-no-tracking.mjs https://<site>.netlify.app
 *
 * For / and /privacy, as served (redirects followed one hop at a time):
 *   1. No response sets a cookie (no Set-Cookie header).
 *   2. The page loads nothing from another origin: no script, stylesheet, font, image, iframe,
 *      media, embed, preload or preconnect whose address is another site. Same-origin
 *      stylesheets are fetched too, and checked for cookies and for fonts or imports elsewhere.
 * Exit code 0 only if every check passes.
 *
 * It reads the HTML and CSS the server sends. A request that JavaScript makes later, after the
 * page has loaded, is not seen here: the browser's developer tools (Network, and Application ›
 * Cookies) are the check for that, and network-privacy.test.ts guards it in the source.
 */
const site = process.argv[2];
// https for a live site; plain http only for this machine.
if (!site || !/^(https:\/\/[^/]+|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/.test(site.replace(/\/$/, ""))) {
  console.error("usage: node tools/check-no-tracking.mjs https://<site>.netlify.app");
  process.exit(2);
}
const ORIGIN = new URL(site).origin;
const PAGES = ["/", "/privacy"];
const MAX_REDIRECTS = 5;

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `: ${detail}` : ""}`);
};

/** Every Set-Cookie header of a response. */
const cookiesOf = (res) =>
  typeof res.headers.getSetCookie === "function"
    ? res.headers.getSetCookie()
    : [res.headers.get("set-cookie")].filter(Boolean);

/**
 * GET a same-origin address, following redirects one hop at a time so that a cookie set on a
 * redirect is seen too. Returns the final response's text, and every cookie and hop on the way.
 */
async function get(url) {
  const cookies = [];
  const hops = [];
  let current = new URL(url, ORIGIN);
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const res = await fetch(current, { redirect: "manual", headers: { accept: "text/html,text/css,*/*" } });
    for (const c of cookiesOf(res)) cookies.push(`${current.pathname}: ${c.split(";")[0]}`);
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      const next = new URL(location, current);
      hops.push(`${res.status} ${current.pathname} -> ${next.href}`);
      if (next.origin !== ORIGIN) return { status: res.status, text: "", cookies, hops, leftSite: next.href };
      current = next;
      continue;
    }
    return { status: res.status, type: res.headers.get("content-type") ?? "", text: await res.text(), cookies, hops, url: current };
  }
  return { status: 0, text: "", cookies, hops, tooManyRedirects: true };
}

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** The value of one attribute in a tag's source, or undefined. */
function attr(tag, name) {
  const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i").exec(tag);
  return m ? decode(m[1] ?? m[2] ?? m[3]) : undefined;
}

/** The addresses in a srcset: "a.png 1x, b.png 2x" gives a.png and b.png. */
const srcset = (value) =>
  (value ?? "")
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);

/** url(...) and @import addresses in CSS. */
function cssRefs(css) {
  const refs = [];
  for (const m of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"']*))\s*\)/gi)) {
    refs.push({ kind: "css url() (font or image)", ref: (m[1] ?? m[2] ?? m[3]).trim() });
  }
  for (const m of css.matchAll(/@import\s+(?:url\()?\s*["']?([^"')\s;]+)/gi)) {
    refs.push({ kind: "css @import", ref: m[1] });
  }
  return refs;
}

/** Everything an HTML page asks the browser to fetch, with what kind of thing it is. */
function htmlRefs(html) {
  const refs = [];
  const tags = (name) => html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
  for (const t of tags("script")) if (attr(t, "src")) refs.push({ kind: "script", ref: attr(t, "src") });
  for (const t of tags("link")) {
    const rel = (attr(t, "rel") ?? "").toLowerCase();
    const href = attr(t, "href");
    if (!href) continue;
    if (/\bstylesheet\b/.test(rel)) refs.push({ kind: "stylesheet", ref: href });
    else if (/\b(preload|modulepreload|prefetch)\b/.test(rel)) refs.push({ kind: `${rel} (${attr(t, "as") ?? "any"})`, ref: href });
    else if (/\b(preconnect|dns-prefetch)\b/.test(rel)) refs.push({ kind: `${rel} (a connection)`, ref: href });
    else if (/\b(icon|apple-touch-icon|manifest|mask-icon)\b/.test(rel)) refs.push({ kind: `${rel} (image)`, ref: href });
  }
  for (const t of tags("img")) {
    if (attr(t, "src")) refs.push({ kind: "image", ref: attr(t, "src") });
    for (const r of srcset(attr(t, "srcset"))) refs.push({ kind: "image (srcset)", ref: r });
  }
  for (const t of tags("source")) {
    if (attr(t, "src")) refs.push({ kind: "media source", ref: attr(t, "src") });
    for (const r of srcset(attr(t, "srcset"))) refs.push({ kind: "image (srcset)", ref: r });
  }
  for (const [name, a, kind] of [
    ["iframe", "src", "iframe"],
    ["frame", "src", "iframe"],
    ["video", "src", "media"],
    ["video", "poster", "image"],
    ["audio", "src", "media"],
    ["embed", "src", "embed"],
    ["object", "data", "embed"],
  ]) {
    for (const t of tags(name)) if (attr(t, a)) refs.push({ kind, ref: attr(t, a) });
  }
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) refs.push(...cssRefs(m[1]));
  for (const m of html.matchAll(/\sstyle\s*=\s*"([^"]*)"/gi)) refs.push(...cssRefs(decode(m[1])));
  return refs;
}

/** The absolute address of a reference, or null for one that fetches nothing (data:, #frag). */
function resolve(ref, base) {
  if (/^(data|blob|about|javascript|mailto|tel):/i.test(ref) || ref.startsWith("#")) return null;
  try {
    return new URL(ref, base);
  } catch {
    return null;
  }
}

console.log(`Checking ${ORIGIN}${PAGES.join(`, ${ORIGIN}`)}\n`);
/** Same-origin stylesheets, fetched once; each page is still checked in full. */
const sheets = new Map();
const sheet = async (href) => {
  if (!sheets.has(href)) sheets.set(href, await get(href));
  return sheets.get(href);
};

for (const path of PAGES) {
  let page;
  try {
    page = await get(path);
  } catch (error) {
    check(`${path} answers`, false, String(error?.message ?? error));
    continue;
  }
  for (const hop of page.hops) console.log(`      redirect ${hop}`);
  if (page.leftSite || page.tooManyRedirects || page.status !== 200) {
    const why = page.leftSite ? `redirects to another site, ${page.leftSite}` : page.tooManyRedirects ? "too many redirects" : `status ${page.status}`;
    check(`${path} answers`, false, why);
    continue;
  }
  check(`${path} answers`, true, `200 ${page.type.split(";")[0]}`);

  const cookies = [...page.cookies];
  const foreign = [];
  const refs = htmlRefs(page.text).map((r) => ({ ...r, from: path }));

  // Same-origin stylesheets: their own cookies, and the fonts or imports they pull in.
  const queue = refs.filter((r) => r.kind === "stylesheet" || r.kind === "css @import").map((r) => resolve(r.ref, page.url));
  const seenCss = new Set();
  while (queue.length > 0) {
    const css = queue.shift();
    if (!css || css.origin !== ORIGIN || seenCss.has(css.href)) continue;
    seenCss.add(css.href);
    const fetched = await sheet(css.href);
    cookies.push(...fetched.cookies);
    for (const r of cssRefs(fetched.text)) {
      refs.push({ ...r, from: css.pathname });
      if (r.kind === "css @import") queue.push(resolve(r.ref, css));
    }
  }

  for (const r of refs) {
    const url = resolve(r.ref, r.from.endsWith(".css") ? new URL(r.from, ORIGIN) : page.url);
    if (url && url.origin !== ORIGIN) foreign.push(`${r.kind} ${url.href} (in ${r.from})`);
  }

  check(`${path} sets no cookies`, cookies.length === 0, cookies.length ? cookies.join("; ") : "no Set-Cookie header");
  const local = refs.filter((r) => resolve(r.ref, page.url)).length;
  check(
    `${path} loads nothing from other sites`,
    foreign.length === 0,
    foreign.length ? `\n        ${foreign.join("\n        ")}` : `${local} address(es), all ${ORIGIN}`,
  );
}

const failed = results.filter((r) => !r.pass).length;
console.log(`\n${failed === 0 ? "All checks passed." : `${failed} check(s) failed.`}`);
// exitCode, not process.exit(): exiting while fetch's sockets close can crash Node on Windows.
process.exitCode = failed === 0 ? 0 : 1;
