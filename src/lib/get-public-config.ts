import { createServerFn } from "@tanstack/react-start";
import { readPublicConfig } from "./public-config.ts";

/**
 * Runs on the server for every visit, so the environment is read at request time (not baked
 * in at build). Returns only whether the email form is on, plus the guide link. The capture
 * address itself never leaves the server.
 */
export const getPublicConfig = createServerFn({ method: "GET" }).handler(async () =>
  readPublicConfig(process.env, { devServer: import.meta.env.DEV }),
);
