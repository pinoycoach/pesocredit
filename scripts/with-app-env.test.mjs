import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import {
  APP_ENV_REL_PATH,
  mergeAppEnv,
  parseAppEnv,
  projectRoot,
  readAppEnv,
  resolveLocalBin,
} from "./with-app-env.mjs";

const execFileAsync = promisify(execFile);
const WRAPPER = join(projectRoot(), "scripts/with-app-env.mjs");
const PRINT_FLAG = "process.stdout.write(String(process.env.VITE_AUTH_ENABLED));";

function makeWorkspace(appEnvJson) {
  const root = mkdtempSync(join(tmpdir(), "app-env-"));
  if (appEnvJson !== undefined) {
    mkdirSync(join(root, ".grok"), { recursive: true });
    writeFileSync(join(root, APP_ENV_REL_PATH), appEnvJson);
  }
  return root;
}

test("keeps VITE_-prefixed string entries", () => {
  assert.deepEqual(parseAppEnv('{"VITE_AUTH_ENABLED":"false"}'), {
    VITE_AUTH_ENABLED: "false",
  });
});

test("drops non-VITE keys, non-string values and malformed documents", () => {
  assert.deepEqual(parseAppEnv('{"DATABASE_URL":"postgres://x","VITE_N":1,"VITE_OK":"y"}'), {
    VITE_OK: "y",
  });
  assert.deepEqual(parseAppEnv("not json"), {});
  assert.deepEqual(parseAppEnv('["VITE_AUTH_ENABLED"]'), {});
  assert.deepEqual(parseAppEnv("null"), {});
});

test("a missing app-env.json is a clean no-op", () => {
  assert.deepEqual(readAppEnv(makeWorkspace()), {});
});

test("reads the app env from a workspace", () => {
  const root = makeWorkspace('{"VITE_AUTH_ENABLED":"false"}');
  assert.deepEqual(readAppEnv(root), { VITE_AUTH_ENABLED: "false" });
});

test("an explicit process-env override wins over the file", () => {
  const merged = mergeAppEnv(
    { VITE_AUTH_ENABLED: "false" },
    { VITE_AUTH_ENABLED: "true", PATH: "/usr/bin" },
  );
  assert.equal(merged.VITE_AUTH_ENABLED, "true");
  assert.equal(merged.PATH, "/usr/bin");
});

test("the template ships auth off", () => {
  assert.deepEqual(readAppEnv(projectRoot()), { VITE_AUTH_ENABLED: "false" });
});

test("vite loadEnv resolves the wrapped value", () => {
  // What `import.meta.env.VITE_AUTH_ENABLED` becomes: loadEnv prefix-matches
  // process.env, so the wrapper's merge has to land before Vite starts.
  // Do not `import { loadEnv } from "vite"` here — Vite 8 loads rolldown
  // native bindings that SIGSEGV the test worker under qemu-user.
  const root = makeWorkspace('{"VITE_AUTH_ENABLED":"false"}');
  const merged = mergeAppEnv(readAppEnv(root), { PATH: "/usr/bin" });
  assert.equal(merged.VITE_AUTH_ENABLED, "false");
});

/** A workspace whose node_modules holds one package with the given package.json. */
function makeWorkspaceWithPackage(name, packageJson, files = {}) {
  const root = makeWorkspace();
  const dir = join(root, "node_modules", name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify(packageJson));
  for (const [file, body] of Object.entries(files)) writeFileSync(join(dir, file), body);
  return { root, dir };
}

test("resolveLocalBin reads a string bin", () => {
  const { root, dir } = makeWorkspaceWithPackage("tool", { bin: "cli.js" });
  assert.equal(resolveLocalBin("tool", root), join(dir, "cli.js"));
});

test("resolveLocalBin reads the bin named after the package", () => {
  const { root, dir } = makeWorkspaceWithPackage("tool", {
    bin: { other: "other.js", tool: "bin/tool.js" },
  });
  assert.equal(resolveLocalBin("tool", root), join(dir, "bin/tool.js"));
});

test("resolveLocalBin returns null when there is nothing to run", () => {
  const { root } = makeWorkspaceWithPackage("tool", { bin: { other: "other.js" } });
  assert.equal(resolveLocalBin("tool", root), null, "no bin named after the package");
  assert.equal(resolveLocalBin("missing", root), null, "package not installed");
  const { root: noBin } = makeWorkspaceWithPackage("tool", {});
  assert.equal(resolveLocalBin("tool", noBin), null, "package without bin");
});

test("resolveLocalBin only resolves bare package names", () => {
  const { root } = makeWorkspaceWithPackage("tool", { bin: "cli.js" });
  for (const command of [process.execPath, "../tool", "a/tool", "@scope/tool", "", "-e"]) {
    assert.equal(resolveLocalBin(command, root), null, JSON.stringify(command));
  }
});

test("vite resolves to a real JS file in this workspace", () => {
  const entry = resolveLocalBin("vite", projectRoot());
  assert.ok(entry?.endsWith(".js"), `unexpected entry: ${entry}`);
  assert.ok(existsSync(entry), `missing file: ${entry}`);
});

test("the wrapper launches a local package's bin without a shell", async () => {
  // The Windows failure was `spawn vite ENOENT`: npm's `.bin/vite` there is a
  // `.cmd` shim. A copy of the wrapper in a temp workspace has that workspace
  // as its project root, so this runs the bare-name path end to end.
  const { root } = makeWorkspaceWithPackage(
    "fakebin",
    { bin: { fakebin: "cli.js" } },
    { "cli.js": "process.stdout.write(JSON.stringify(process.argv.slice(2)));" },
  );
  mkdirSync(join(root, "scripts"));
  copyFileSync(WRAPPER, join(root, "scripts", "with-app-env.mjs"));
  const { stdout } = await execFileAsync(process.execPath, [
    join(root, "scripts", "with-app-env.mjs"),
    "fakebin",
    "dev",
    "--port",
    "8080",
  ]);
  assert.deepEqual(JSON.parse(stdout), ["dev", "--port", "8080"]);
});

test("the wrapped command runs with the app env applied", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    WRAPPER,
    process.execPath,
    "-e",
    PRINT_FLAG,
  ]);
  assert.equal(stdout, "false");
});

test("the wrapped command sees an explicit override, not the file value", async () => {
  const { stdout } = await execFileAsync(
    process.execPath,
    [WRAPPER, process.execPath, "-e", PRINT_FLAG],
    { env: { ...process.env, VITE_AUTH_ENABLED: "true" } },
  );
  assert.equal(stdout, "true");
});

test("the wrapper propagates the command's exit code", async () => {
  await assert.rejects(
    execFileAsync(process.execPath, [WRAPPER, process.execPath, "-e", "process.exit(3)"]),
    (err) => err.code === 3,
  );
});

test("a signal-killed command is never reported as success", async () => {
  // The wrapper's own SIGTERM handler must not swallow the re-raised signal:
  // a cancelled build reporting exit 0 is a silently passing gate.
  await assert.rejects(
    execFileAsync(process.execPath, [
      WRAPPER,
      process.execPath,
      "-e",
      "process.kill(process.pid, 'SIGTERM');setTimeout(() => {}, 1000);",
    ]),
    (err) => err.signal === "SIGTERM" || err.code !== 0,
  );
});

test("the CLI still runs when invoked through a symlinked path", async () => {
  // node realpaths import.meta.url but not process.argv[1], so a raw comparison
  // turns the wrapper into a no-op that exits 0 without starting anything.
  const link = join(mkdtempSync(join(tmpdir(), "app-env-link-")), "scripts");
  // "junction" avoids the EPERM a plain directory symlink hits on Windows without
  // Developer Mode; Node ignores the argument on macOS and Linux.
  symlinkSync(join(projectRoot(), "scripts"), link, "junction");
  const { stdout } = await execFileAsync(process.execPath, [
    join(link, "with-app-env.mjs"),
    process.execPath,
    "-e",
    PRINT_FLAG,
  ]);
  assert.equal(stdout, "false");
});
