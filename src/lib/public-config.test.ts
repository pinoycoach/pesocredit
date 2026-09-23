import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeGuideUrl, readPublicConfig } from "./public-config.ts";

/** Usable Resend settings (DECISIONS N13). */
const RESEND = {
  RESEND_API_KEY: "re_test_secret-123",
  SUBSCRIBE_NOTIFY_TO: "owner@inbox.example",
  SUBSCRIBE_FROM: "peso.credit <subscribe@peso.credit>",
};

describe("public config", () => {
  it("hides both the form and the guide when nothing is set", () => {
    assert.deepEqual(readPublicConfig({}), { emailCaptureEnabled: false, guideUrl: null });
    assert.deepEqual(readPublicConfig({ RESEND_API_KEY: "", GUIDE_URL: "  " }), {
      emailCaptureEnabled: false,
      guideUrl: null,
    });
  });

  it("shows the form only when all three Resend settings are usable", () => {
    assert.equal(readPublicConfig(RESEND).emailCaptureEnabled, true);
    for (const missing of Object.keys(RESEND)) {
      const env: Record<string, string | undefined> = { ...RESEND, [missing]: undefined };
      assert.equal(readPublicConfig(env).emailCaptureEnabled, false, `without ${missing}`);
    }
    assert.equal(readPublicConfig({ ...RESEND, RESEND_API_KEY: "sk_not_resend" }).emailCaptureEnabled, false);
  });

  it("never reveals the key or the owner's inbox to the page", () => {
    const config = readPublicConfig({ ...RESEND, GUIDE_URL: "https://guide.example/p" });
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
    assert.equal(readPublicConfig(RESEND, { devServer: true }).emailCaptureEnabled, false, "plain npm run dev");
    assert.equal(
      readPublicConfig({ ...RESEND, NETLIFY_DEV: "true" }, { devServer: true }).emailCaptureEnabled,
      true,
      "netlify dev",
    );
    assert.equal(readPublicConfig(RESEND).emailCaptureEnabled, true, "a production build");
    assert.equal(
      readPublicConfig({ GUIDE_URL: "https://guide.example/p" }, { devServer: true }).guideUrl,
      "https://guide.example/p",
      "the guide link does not depend on the endpoint",
    );
  });

  it("the guide link and the form are independent of each other", () => {
    assert.deepEqual(readPublicConfig({ GUIDE_URL: "https://guide.example/p" }), {
      emailCaptureEnabled: false,
      guideUrl: "https://guide.example/p",
    });
  });
});
