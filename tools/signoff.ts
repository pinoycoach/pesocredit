/**
 * SIGNOFF.json tools (see src/lib/signoff.ts).
 *
 *   npm run signoff:hashes   each item's status, current hash, and the exact content it covers
 *   npm run launch-check     fails unless SIGNOFF.json is sound and every item is signed;
 *                            a production deploy requires it to pass (HANDOVER.md)
 *
 * To sign, Napoleon copies the printed hash into SIGNOFF.json with the signer, the date and
 * (optionally) reviewedBy, and commits. Claude never writes a signature.
 */
import { readFileSync } from "node:fs";
import {
  contentOf,
  currentHashes,
  SIGNOFF_IDS,
  type SignoffRecord,
  unsigned,
  validate,
} from "../src/lib/signoff.ts";

const record = JSON.parse(
  readFileSync(new URL("../SIGNOFF.json", import.meta.url), "utf8"),
) as SignoffRecord;
const current = currentHashes();
const problems = validate(record, current, new Date());
const command = process.argv[2];

if (command === "hashes") {
  for (const id of SIGNOFF_IDS) {
    const signature = record.items.find((item) => item.id === id)?.signature ?? null;
    const status = !signature
      ? "not signed"
      : signature.hash === current[id]
        ? `signed by ${signature.signer} on ${signature.date}`
        : `CHANGED since ${signature.signer} signed it on ${signature.date}`;
    console.log(`\n=== ${id}: ${status}\n${current[id]}\n`);
    console.log(JSON.stringify(contentOf(id), null, 2));
  }
  if (problems.length > 0) console.log(`\nProblems:\n- ${problems.join("\n- ")}`);
} else if (command === "launch-check") {
  const open = problems.length === 0 ? unsigned(record) : [];
  if (problems.length > 0) {
    console.error(`launch-check FAILED: SIGNOFF.json has problems:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
  if (open.length > 0) {
    console.error(`launch-check FAILED: not signed yet: ${open.join(", ")}`);
    process.exit(1);
  }
  console.log(`launch-check passed: ${SIGNOFF_IDS.join(", ")} signed, content unchanged since.`);
} else {
  console.error("usage: node --experimental-strip-types tools/signoff.ts hashes | launch-check");
  process.exit(2);
}
