import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ReactNode } from "react";
import { copy } from "./copy.ts";
import { cap, plainText } from "./segments.ts";

describe("segments", () => {
  it("cap-bearing copy cannot be shown as plain text: that is a compile-time guarantee", () => {
    // Each @ts-expect-error below must stay an error. If cap copy ever became renderable
    // without <CapSegments>, `npm run typecheck` fails here with "unused directive".
    // @ts-expect-error a cap is an object React cannot render on its own
    const ceiling: ReactNode = copy.ceilingCapText.eir;
    // @ts-expect-error the same holds for a sentence that contains a cap
    const hint: ReactNode = copy.penaltyHint;
    // Ordinary text is still ordinary text.
    const plain: ReactNode = "walang cap dito";
    assert.ok(ceiling && hint && plain);
  });

  it("plainText joins text and caps in order", () => {
    assert.equal(plainText(["hanggang ", cap("12% kada buwan"), "."]), "hanggang 12% kada buwan.");
    assert.equal(plainText([]), "");
  });

  it("cap() marks a piece of text without changing it", () => {
    assert.deepEqual(cap("6%"), { cap: "6%" });
  });
});
