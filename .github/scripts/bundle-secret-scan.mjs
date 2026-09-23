#!/usr/bin/env node
/**
 * CI: EMAIL_CAPTURE_URL never reaches the browser (DECISIONS N29, BUILD-STANDARD points
 * 9 and 11). This deletes the build output, builds fresh with a dummy capture URL that
 * carries a random secret, then fails if any client file contains the secret, the
 * capture address or the variable's name, or if the server bundle has the value baked
 * in (it must read it at request time). It builds itself, so it can never scan a stale
 * build. Written to run the same way on Windows, macOS and Linux.
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Host-specific (CLAUDE.md "Host-specific files"): Nitro's netlify preset writes the client
// files to dist/ and the app's server function to .netlify/functions-internal/.
const CLIENT = "dist";
const SERVER = join(".netlify", "functions-internal");

const secret = `ci-dummy-secret-${randomUUID()}`;
const captureHost = `capture-${randomUUID().slice(0, 8)}.invalid`;
const captureUrl = `https://${captureHost}/hook?key=${secret}`;

/** Every file under `dir`, recursively. */
function filesIn(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name));
}

/** The files under `dir` that contain any of `needles`, with the needle found. */
function scan(dir, needles) {
  const hits = [];
  for (const file of filesIn(dir)) {
    const text = readFileSync(file).toString("latin1");
    for (const needle of needles) if (text.includes(needle)) hits.push(`${file}: ${needle}`);
  }
  return hits;
}

function fail(message) {
  console.error(`bundle secret scan FAILED: ${message}`);
  process.exit(1);
}

// The scanner itself: it must find a planted secret (point 6).
const planted = mkdtempSync(join(tmpdir(), "secret-scan-"));
writeFileSync(join(planted, "chunk.js"), `const u = "${captureUrl}";`);
if (scan(planted, [secret]).length !== 1) fail("the scanner did not find a planted secret");
rmSync(planted, { recursive: true, force: true });

// A fresh build with the dummy secret set.
for (const dir of [CLIENT, SERVER]) rmSync(dir, { recursive: true, force: true });
const build = spawnSync("npm run build", {
  shell: true,
  stdio: "inherit",
  env: { ...process.env, EMAIL_CAPTURE_URL: captureUrl },
});
if (build.status !== 0) fail(`npm run build exited with ${build.status}`);
if (!existsSync(CLIENT) || !existsSync(SERVER)) fail(`no build output in ${CLIENT} and ${SERVER}`);

const clientFiles = filesIn(CLIENT);
if (!clientFiles.some((f) => f.endsWith(".js"))) fail(`no client JavaScript in ${CLIENT}`);

const clientHits = scan(CLIENT, [secret, captureHost, "EMAIL_CAPTURE_URL"]);
if (clientHits.length > 0) fail(`found in client output:\n- ${clientHits.join("\n- ")}`);

const serverHits = scan(SERVER, [secret, captureHost]);
if (serverHits.length > 0) fail(`baked into the server bundle:\n- ${serverHits.join("\n- ")}`);

console.log(
  `bundle secret scan passed: fresh build with a dummy EMAIL_CAPTURE_URL; ${clientFiles.length} client files ` +
    "contain neither the secret, the capture address nor the variable name, and the server bundle does not bake the value in.",
);
