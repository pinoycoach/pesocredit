#!/usr/bin/env node
/**
 * CI smoke test for `npm run dev`. It must start, serve the page, and listen on
 * loopback only. Written to run the same way on Windows, macOS and Linux.
 */
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";
import os from "node:os";

const PORT = 8080;
const PAGE_URL = `http://127.0.0.1:${PORT}/`;
const STARTUP_TIMEOUT_MS = 90_000;

// One command string with `shell: true`: on Windows `npm` is `npm.cmd`, which
// cannot be spawned without a shell. Detached on POSIX so the whole process
// group (npm, then vite) can be stopped together.
const child = spawn("npm run dev", {
  shell: true,
  stdio: "inherit",
  detached: process.platform !== "win32",
});

let exited = false;
child.on("exit", (code) => {
  exited = true;
  console.error(`npm run dev exited (code ${code})`);
});

function stop() {
  if (exited) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
  } else {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      // already gone
    }
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForPage() {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (exited) throw new Error("npm run dev exited before serving the page");
    try {
      const res = await fetch(PAGE_URL, { signal: AbortSignal.timeout(5_000) });
      const body = await res.text();
      if (res.status === 200 && body.includes("Tunay na Interes")) return;
    } catch {
      // not up yet
    }
    await sleep(1_000);
  }
  throw new Error(
    `no 200 with the app's title from ${PAGE_URL} within ${STARTUP_TIMEOUT_MS / 1000}s`,
  );
}

function externalIPv4() {
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && !address.internal) return address.address;
    }
  }
  return null;
}

function canConnect(host) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port: PORT, timeout: 3_000 });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => resolve(false));
  });
}

let failed = false;
try {
  await waitForPage();
  console.log(`OK: ${PAGE_URL} returned 200 with the app's title`);

  // Positive control first, so a broken probe cannot pass the check below.
  if (!(await canConnect("127.0.0.1"))) throw new Error("cannot connect to 127.0.0.1 either");

  const ip = externalIPv4();
  if (!ip) {
    console.log("SKIP: no non-loopback IPv4 address on this machine to test against");
  } else if (await canConnect(ip)) {
    throw new Error(
      `the dev server accepted a connection on ${ip}:${PORT}; expected loopback only`,
    );
  } else {
    console.log(`OK: ${ip}:${PORT} refused the connection, so the server is loopback only`);
  }
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  failed = true;
} finally {
  stop();
}
process.exit(failed ? 1 : 0);
