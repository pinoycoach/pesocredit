#!/usr/bin/env node
/**
 * Renders every on-screen part of the app to static HTML, so a refactor can be proved to change
 * nothing a visitor sees (Phase 4 step F2). Compare two runs with `cmp`:
 *
 *   node tools/render-snapshot.mjs before.html   (before the change)
 *   node tools/render-snapshot.mjs after.html    (after it)
 *
 * It uses Vite's SSR loader with a minimal config (only the "@" alias), so it is independent
 * of the app's build plugins. Covered: the page header and the whole calculator (email form and
 * guide link off, then on); the result components for every golden and coverage loan; the loan
 * timeline, short and long, with and without a follow-up day; the privacy page and its head
 * tags; the root head tags; the error page. React's "<!-- -->" separators between adjacent text
 * pieces are removed: moving words from JSX into one string changes where they fall, not what a
 * visitor sees.
 */
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const out = process.argv[2];
if (!out) {
  console.error("usage: node tools/render-snapshot.mjs <out-file>");
  process.exit(2);
}
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(`${ROOT}package.json`);
const { createServer } = await import(pathToFileURL(require.resolve("vite")).href);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const h = React.createElement;

const server = await createServer({
  configFile: false,
  root: ROOT,
  logLevel: "error",
  resolve: { alias: { "@": `${ROOT}src` } },
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: "custom",
});

const parts = [];
const add = (name, html) => parts.push(`<!-- ${name} -->\n${html.replaceAll("<!-- -->", "")}`);
try {
  const load = (path) => server.ssrLoadModule(path);
  const { analyzeLoan } = await load("/src/lib/loan-math.ts");
  const { GOLDEN_INPUTS, COVERAGE_INPUTS } = await load("/src/lib/test-utils/loan-fixtures.ts");
  const { Calculator } = await load("/src/components/calculator.tsx");
  const { Headline, CeilingComparison, HowComputed } = await load("/src/components/result.tsx");
  const { LoanTimeline } = await load("/src/components/loan-timeline.tsx");
  const index = await load("/src/routes/index.tsx");
  const privacy = await load("/src/routes/privacy.tsx");
  const root = await load("/src/routes/__root.tsx");
  const { AppErrorComponent } = await load("/src/lib/error-component.tsx");

  const off = { emailCaptureEnabled: false, guideUrl: null };
  const on = { emailCaptureEnabled: true, guideUrl: "https://guide.example/p" };

  // The page: the index route's component reads its loader data; give it each config.
  for (const [name, config] of [["off", off], ["on", on]]) {
    index.Route.useLoaderData = () => config;
    add(`page (form and guide ${name})`, renderToStaticMarkup(h(index.Route.options.component)));
  }

  const loans = { ...GOLDEN_INPUTS, ...COVERAGE_INPUTS };
  for (const [name, input] of Object.entries(loans)) {
    const analysis = analyzeLoan(input);
    if (analysis.status === "cannot_compute") continue;
    for (const [part, Component] of [["Headline", Headline], ["CeilingComparison", CeilingComparison], ["HowComputed", HowComputed]]) {
      add(`${part} ${name}`, renderToStaticMarkup(h(Component, { analysis })));
    }
    for (const followUpDay of [null, 4]) {
      const withNote = { ...input, followUpDay };
      add(`LoanTimeline ${name} followUp=${followUpDay}`, renderToStaticMarkup(h(LoanTimeline, { input: withNote, numbers: analysis.numbers })));
    }
  }

  // The calculator on its own, with each config (its default loan).
  for (const [name, config] of [["off", off], ["on", on]]) {
    add(`Calculator (config ${name})`, renderToStaticMarkup(h(Calculator, { publicConfig: config })));
  }

  add("privacy page", renderToStaticMarkup(h(privacy.Route.options.component)));
  add("privacy head", JSON.stringify(privacy.Route.options.head(), null, 2));
  add("root head", JSON.stringify(root.Route.options.head().meta, null, 2));
  add("error page (no message)", renderToStaticMarkup(h(AppErrorComponent, { error: {}, reset() {} })));
} finally {
  await server.close();
}
writeFileSync(out, parts.join("\n\n") + "\n", "utf8");
console.log(`render snapshot: ${parts.length} parts written to ${out}`);
