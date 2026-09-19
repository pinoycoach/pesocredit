/**
 * On-screen wording that depends on rules.ts or on a calculation state. Anything a
 * legal number goes into is built here from rules.ts, never typed out.
 */
import type { CannotComputeReason } from "./loan-math.ts";
import { COVERAGE } from "./rules.ts";

const MONTHS_FIL = [
  "Enero",
  "Pebrero",
  "Marso",
  "Abril",
  "Mayo",
  "Hunyo",
  "Hulyo",
  "Agosto",
  "Setyembre",
  "Oktubre",
  "Nobyembre",
  "Disyembre",
];

/** "2026-04-01" becomes "1 Abril 2026". */
export function formatDateFil(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS_FIL[month - 1]} ${year}`;
}

export const OLD_LOAN_NOTICE = `Ang tool na ito ay para sa loans simula ${formatDateFil(COVERAGE.appliesToLoansFrom)}.`;

export const CANNOT_COMPUTE_TEXT: Record<CannotComputeReason, string> = {
  invalid_input: "Maglagay ng principal at hulog para makita ang totoong gastos.",
  invalid_date: "Ilagay ang petsa ng kontrata para makita ang resulta.",
  fee_not_less_than_principal:
    "Hindi makalkula: ang binawas na fee ay hindi dapat katumbas o lampas sa inutang. Pakisuri ang mga numero.",
  payments_below_principal:
    "Hindi makalkula: mas mababa ang kabuuang hulog kaysa sa natanggap mo. Pakisuri ang mga numero.",
  no_solution: "Hindi makalkula ang rate sa mga numerong ito. Pakisuri ang mga numero.",
};
