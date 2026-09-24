import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emailFormAllowed } from "./privacy-copy.ts";
import { normalizeGuideUrl, readPublicConfig } from "./public-config.ts";

/** Usable Resend settings (DECISIONS N13). */
const RESEND = {
  RESEND_API_KEY: "re_test_secret-123",
  SUBSCRIBE_NOTIFY_TO: "owner@inbox.example",
  SUBSCRIBE_FROM: "peso.credit <subscribe@peso.credit>",
};

/** The full privacy page, final, so the tests below can see the form (C107, N45). */
const FINAL = { privacy: { version: "full", status: "final" } } as const;

describe("public config", () => {
  it("hides both the form and the guide when nothing is set", () => {
    assert.deepEqual(readPublicConfig({}, FINAL), { emailCaptureEnabled: false, guideUrl: null });
    assert.deepEqual(readPublicConfig({ RESEND_API_KEY: "", GUIDE_URL: "  " }, FINAL), {
      emailCaptureEnabled: false,
      guideUrl: null,
    });
  });

  it("shows the form only when all three Resend settings are usable", () => {
    assert.equal(readPublicConfig(RESEND, FINAL).emailCaptureEnabled, true);
    for (const missing of Object.keys(RESEND)) {
      const env: Record<string, string | undefined> = { ...RESEND, [missing]: undefined };
      assert.equal(readPublicConfig(env, FINAL).emailCaptureEnabled, false, `without ${missing}`);
    }
    assert.equal(readPublicConfig({ ...RESEND, RESEND_API_KEY: "sk_not_resend" }, FINAL).emailCaptureEnabled, false);
  });

  it("hides the form while the privacy page is a draft, even with every setting usable (C107)", () => {
    const draft = { version: "full", status: "draft" } as const;
    assert.equal(readPublicConfig(RESEND, { privacy: draft }).emailCaptureEnabled, false);
    assert.equal(
      readPublicConfig({ ...RESEND, NETLIFY_DEV: "true" }, { devServer: true, privacy: draft })
        .emailCaptureEnabled,
      false,
      "under netlify dev too",
    );
    assert.equal(readPublicConfig(RESEND, FINAL).emailCaptureEnabled, true, "and shows it once the page is final");
  });

  it("hides the form under the v1 privacy page, even final and with every setting usable (N45)", () => {
    for (const status of ["draft", "final"] as const) {
      const v1 = { privacy: { version: "v1", status } } as const;
      assert.equal(readPublicConfig(RESEND, v1).emailCaptureEnabled, false, `v1, ${status}`);
      assert.equal(
        readPublicConfig({ ...RESEND, NETLIFY_DEV: "true" }, { devServer: true, ...v1 }).emailCaptureEnabled,
        false,
        `v1, ${status}, under netlify dev`,
      );
    }
  });

  it("follows the live privacy page (PRIVACY_VERSION, PRIVACY_STATUS) when none is given", () => {
    assert.equal(readPublicConfig(RESEND).emailCaptureEnabled, emailFormAllowed());
  });

  it("never reveals the key or the owner's inbox to the page", () => {
    const config = readPublicConfig({ ...RESEND, GUIDE_URL: "https://guide.example/p" }, FINAL);
    assert.deepEqual(Object.keys(config).sort(), ["emailCaptureEnabled", "guideUrl"]);
    assert.ok(!JSON.stringify(config).includes("secret-123"));
    assert.ok(!JSON.stringify(config).includes("owner@inbox.example"));
  });

  it("passes on the guide link only when it is an http(s) address", () => {
    assert.equal(normalizeGuideUrl("https://guide.example/p"), "https://guide.example/p");
    assert.equal(normalizeGuideUrl("  http://guide.example/p "), "http://guide.example/p");
    for (const bad of [undefined, "", "guide", "javascript:alert(1)", "data:text/html,x", "mailto:a@b.c", "ftp://x.example"]) {
      assert.equal(normalizeGuideUrl(bad), null, String(bad));
    }
  });

  it("under a dev server the form shows only where /api/subscribe exists (netlify dev)", () => {
    assert.equal(readPublicConfig(RESEND, { devServer: true, ...FINAL }).emailCaptureEnabled, false, "plain npm run dev");
    assert.equal(
      readPublicConfig({ ...RESEND, NETLIFY_DEV: "true" }, { devServer: true, ...FINAL }).emailCaptureEnabled,
      true,
      "netlify dev",
    );
    assert.equal(readPublicConfig(RESEND, FINAL).emailCaptureEnabled, true, "a production build");
    assert.equal(
      readPublicConfig({ GUIDE_URL: "https://guide.example/p" }, { devServer: true }).guideUrl,
      "https://guide.example/p",
      "the guide link does not depend on the endpoint",
    );
  });

  it("the guide link and the form are independent of each other", () => {
    assert.deepEqual(readPublicConfig({ GUIDE_URL: "https://guide.example/p" }, FINAL), {
      emailCaptureEnabled: false,
      guideUrl: "https://guide.example/p",
    });
  });
});
