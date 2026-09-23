import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeGuideUrl, readPublicConfig } from "./public-config.ts";

describe("public config", () => {
  it("hides both the form and the guide when nothing is set", () => {
    assert.deepEqual(readPublicConfig({}), { emailCaptureEnabled: false, guideUrl: null });
    assert.deepEqual(readPublicConfig({ EMAIL_CAPTURE_URL: "", GUIDE_URL: "  " }), {
      emailCaptureEnabled: false,
      guideUrl: null,
    });
  });

  it("shows the form only for a usable capture address", () => {
    assert.equal(readPublicConfig({ EMAIL_CAPTURE_URL: "https://capture.example/hook" }).emailCaptureEnabled, true);
    assert.equal(readPublicConfig({ EMAIL_CAPTURE_URL: "http://127.0.0.1:9000/hook" }).emailCaptureEnabled, true);
    for (const bad of ["http://capture.example/hook", "nonsense", "ftp://capture.example", "javascript:alert(1)"]) {
      assert.equal(readPublicConfig({ EMAIL_CAPTURE_URL: bad }).emailCaptureEnabled, false, bad);
    }
  });

  it("never reveals the capture address to the page", () => {
    const secret = "https://capture.example/hook?key=secret-123";
    const config = readPublicConfig({ EMAIL_CAPTURE_URL: secret, GUIDE_URL: "https://guide.example/p" });
    assert.deepEqual(Object.keys(config).sort(), ["emailCaptureEnabled", "guideUrl"]);
    assert.ok(!JSON.stringify(config).includes("secret-123"));
    assert.ok(!JSON.stringify(config).includes("capture.example"));
  });

  it("passes on the guide link only when it is an http(s) address", () => {
    assert.equal(normalizeGuideUrl("https://guide.example/p"), "https://guide.example/p");
    assert.equal(normalizeGuideUrl("  http://guide.example/p "), "http://guide.example/p");
    for (const bad of [undefined, "", "guide", "javascript:alert(1)", "data:text/html,x", "mailto:a@b.c", "ftp://x.example"]) {
      assert.equal(normalizeGuideUrl(bad), null, String(bad));
    }
  });

  it("under a dev server the form shows only where /api/subscribe exists (netlify dev)", () => {
    const env = { EMAIL_CAPTURE_URL: "https://capture.example/hook" };
    assert.equal(readPublicConfig(env, { devServer: true }).emailCaptureEnabled, false, "plain npm run dev");
    assert.equal(
      readPublicConfig({ ...env, NETLIFY_DEV: "true" }, { devServer: true }).emailCaptureEnabled,
      true,
      "netlify dev",
    );
    assert.equal(readPublicConfig(env).emailCaptureEnabled, true, "a production build");
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
