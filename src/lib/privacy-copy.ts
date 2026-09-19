/**
 * The privacy page, in words. DRAFT for a lawyer to review.
 *
 * It states only what this app verifiably does (see network-privacy.test.ts and
 * subscribe.test.ts) and leaves a visible [ILAGAY DITO: ...] placeholder for everything
 * the owner must supply or a lawyer must decide. No operator, address, provider name or
 * retention period is invented here. A test lists the placeholders that remain, and the
 * page stays noindex while any do.
 */
import { NO_STORAGE_NOTE } from "./copy.ts";

export const PLACEHOLDER_OPEN = "[ILAGAY DITO:";

/** A blank the owner (or a lawyer) has to fill before this page is final. */
export const placeholder = (what: string) => `${PLACEHOLDER_OPEN} ${what}]`;

export const PRIVACY_TITLE = "Patakaran sa Privacy";

export const DRAFT_BANNER =
  "DRAFT — para sa pagsusuri ng abogado. Hindi pa ito pinal at hindi pa dapat ituring na opisyal na patakaran.";

export const BACK_TO_CALCULATOR = "Balik sa calculator";

export const PRIVACY_LINK_LABEL = "Patakaran sa Privacy";

export type PrivacySection = { heading: string; paragraphs: string[] };

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    heading: "Ano ang kinokolekta namin",
    paragraphs: [
      "Ang email address mo at ang oras ng pagpayag mo. Ibinibigay mo lang ang mga ito sa opsyonal na form sa calculator, at kinokolekta lang namin kung pumayag ka (naka-tsek ang kahon ng pagpayag). Iyon lang.",
    ],
  },
  {
    heading: "Ano ang hindi namin kinokolekta",
    paragraphs: [
      `${NO_STORAGE_NOTE} Ang pagkuwenta ay ginagawa sa device mo, at hindi kailanman isinasama ang mga numerong iyon sa email form.`,
      "Wala kaming account, at walang analytics o tracking sa site na ito. Ang site mismo ay hindi nagse-set ng cookies, at ang mga font ay galing sa sarili naming site, hindi sa ibang website.",
      "Kapag pinindot mo ang link sa SEC (sec.gov.ph), aalis ka sa site na ito at ang website ng SEC na ang may hawak ng pagbisita mo.",
    ],
  },
  {
    heading: "Bakit namin ito kinokolekta",
    paragraphs: [
      "Para ipadala ang libreng checklist at ang mga abiso tungkol sa bagong rules na hiniling mo, at para may talaan kami na pumayag ka.",
    ],
  },
  {
    heading: "Kanino napupunta ang email mo",
    paragraphs: [
      `Ipinapadala ito sa aming email service provider, ${placeholder("pangalan ng email service provider")}, para sila ang magpadala ng mga email. Ang ipinapadala lang ay ang email address at ang oras ng pagpayag mo.`,
      `Ang site na ito ay naka-host sa ${placeholder("pangalan ng hosting provider")}. ${placeholder("para sa abogado: ilarawan kung anong technical na detalye ng pagbisita, tulad ng IP address, ang maaaring itala ng hosting provider")}`,
    ],
  },
  {
    heading: "Gaano katagal namin itong iniingatan",
    paragraphs: [placeholder("gaano katagal iniingatan ang email at oras ng pagpayag")],
  },
  {
    heading: "Paano mag-unsubscribe o magpabura ng email",
    paragraphs: [
      `Gamitin ang unsubscribe link sa bawat email na matatanggap mo. ${placeholder("kumpirmahin na may unsubscribe link ang napiling email service provider")}`,
      `Puwede ka ring sumulat sa ${placeholder("email address para sa mga kahilingan")} at hihilingin naming burahin ang email mo.`,
    ],
  },
  {
    heading: "Ang mga karapatan mo",
    paragraphs: [placeholder("para sa abogado: ilagay dito ang mga karapatan ng user ayon sa batas at kung paano ito gagamitin")],
  },
  {
    heading: "Makipag-ugnayan",
    paragraphs: [
      `${placeholder("pangalan ng operator ng site")} · ${placeholder("email address ng contact")}`,
    ],
  },
];

/** Every blank still to fill, from all sections. */
export function remainingPlaceholders(): string[] {
  const text = PRIVACY_SECTIONS.flatMap((s) => s.paragraphs).join("\n");
  return [...text.matchAll(/\[ILAGAY DITO: ([^\]]*)\]/g)].map((m) => m[1]);
}

export type TextPart = { text: string; blank: boolean };

/** Split a paragraph so placeholders can be shown highlighted. */
export function splitPlaceholders(paragraph: string): TextPart[] {
  const parts: TextPart[] = [];
  let rest = paragraph;
  for (;;) {
    const start = rest.indexOf(PLACEHOLDER_OPEN);
    const end = start === -1 ? -1 : rest.indexOf("]", start);
    if (start === -1 || end === -1) break;
    if (start > 0) parts.push({ text: rest.slice(0, start), blank: false });
    parts.push({ text: rest.slice(start, end + 1), blank: true });
    rest = rest.slice(end + 1);
  }
  if (rest) parts.push({ text: rest, blank: false });
  return parts;
}
