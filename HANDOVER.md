# HANDOVER.md — peso.credit

Point 2: phases with stops. Point 7: three-part phase reports. Every phase ends with a stop and a
report before the next begins.

## Phase report format (point 7)

1. What was done
2. What was verified, and how
3. What is still open — must match DECISIONS.md exactly (point 16)

## Prior work (built under points 1–7 only)

Tunay na Interes calculator, repo pinoycoach/yarrow-gem-garden-rose: audit → Phase 1 cleanup →
Phase 2 correctness → Phase 3 trust, all approved and pushed by 2026-09-22. Points 8–17 were
written after that build, so it has not been checked against them yet (see Phase 4).

## Phase 0 — Audit and skeleton ✅ done

- Create CLAUDE.md, RULES.md, GOLDEN-CASES.md, HANDOVER.md as skeletons.
- Record known context in DECISIONS.md.
- No product code.
- STOP. Report what's missing before Phase 1.

## Phase 4 — Bring the calculator up to v2, then deploy to peso.credit

Paste into Claude Code, in the local folder whose `git log --oneline -1` shows 6e975d1 (see
DECISIONS N20):

```
Read docs/BUILD-STANDARD.md (points 1–17) and DECISIONS.md first.
This repo is peso.credit. The Tunay na Interes calculator is its first
product and deploys at peso.credit. Plan mode first; one commit per
step; stop after each step group for my review. Do not push or deploy.

STEP GROUP A — Merge the planning files (no behavior change)
1. Add docs/BUILD-STANDARD.md and DECISIONS.md to the repo root/docs.
2. Merge my CLAUDE.md into the existing CLAUDE.md. Keep every existing
   principle and Lesson; add the environment table, standing gates, and
   the point 14/16 emphasis. Show me the diff before committing.
3. RULES.md vs the existing rules-constants file: propose whether
   RULES.md just points at that file or duplicates it. Don't duplicate
   facts in two places (point 1). Ask me.
4. Seed GOLDEN-CASES.md from the golden cases that already exist in
   the tests (with the independent check each was verified against).

STEP GROUP B — Audit against points 8–17 (report only, no fixes)
For each point, say: already satisfied (cite file:line), partially,
or not at all.
- 8: already verified — CI matrix (1b60ed5) and .gitattributes
     (7db0d03) exist, and CI #1 on pesocredit ran green on all 6 jobs
     at 6e975d1. Only re-check if you change anything.
- 9: does the injected-violation / guard harness run build THEN test,
     or test against an existing build?
- 10: do /api/subscribe and consent tests cover the success path, not
     only rejection?
- 11: which earlier-verified checks (UI hash, bundle secret scan,
     mobile layout) have not been re-run since the last change?
- 14: list every piece of public-facing copy (Filipino and English)
     that needs independent content review. Do not rewrite it.
- 15: what credential will /api/subscribe hold, and its narrowest
     possible scope?
- 16: do "still open" items in your report match DECISIONS.md exactly?
Stop and wait.

STEP GROUP C — Fixes I approve from B, one commit each.

STEP GROUP D — v1 launch: the calculator alone, no email form (N45).
I do the dashboard steps; you write the checklist from what I show you
on screen (point 12)
- Netlify site, peso.credit domain + DNS (N9)
- Do not set the Resend settings (RESEND_API_KEY, SUBSCRIBE_NOTIFY_TO,
  SUBSCRIBE_FROM) or GUIDE_URL in Netlify. Under the v1 privacy page the
  form stays off even if they are set (N45), but they stay unset.
- privacy@peso.credit receives mail: a test email arrived in Napoleon's
  Gmail on 2026-09-24 (N45). It forwards through Porkbun, so DNS stays at
  Porkbun: moving it (Netlify DNS, say) drops the forwarding records
  unless they are copied first. Forwarded mail can land in spam: it did
  once, and a Gmail "never send to spam" filter fixed it. Re-test after
  any DNS change, and look in spam.
- English copy written and independently reviewed (N34, N32, N44)
- v1 privacy page signed, PRIVACY_STATUS "final" in the same commit (N45)
- Mobile layout re-checked on the English UI, the v1 privacy page
  included (N31)
- Production deploy requires `npm run launch-check` to pass (SIGNOFF.json)
- On the live site: no email form on the calculator, and a POST to
  /api/subscribe answers 404
v1 deploys once N45 is RESOLVED and launch-check passes. N17, N18 and
N37 do not block it: they block the email form.

LATER — The email form (not before N17, N18 and N37 are RESOLVED)
- Full privacy page with counsel (Pat): blanks filled, the notes in
  docs/privacy-draft-for-lawyer.md answered, PRIVACY_VERSION "full",
  signed again (N17)
- Rate limiting on /api/subscribe: a limit of its own, proven on the
  live site by sending requests until it answers 429 (N18, point 12):
  node tools/prove-rate-limit.mjs https://<site> on a deploy preview,
  then on production; record the output in N18. The proof works before
  the form goes live: the endpoint answers 404 until the full page is
  final, and the limit counts those 404s. Done on the preview and on
  production, https://peso.credit (2026-09-24, 4/4 each): N18 RESOLVED.
- Resend: peso.credit sending domain verified, DNS records copied from
  the live Resend screen (point 12); a Sending-access key restricted to
  that domain, set only in Netlify's environment; the Full-access key
  stays with Napoleon, never in the code or on Netlify (N13, point 15)
- The free checklist the form promises exists, or the promise is
  removed (N37)
- Do not set GUIDE_URL in Netlify until N14 and N15 are RESOLVED.
```

## Later phases — (undefined)

₱99 guide (N14, N15), affiliate pages (N10), lender-naming content (gated by N8), credit cards and
money handling (N5). Not planned until Napoleon supplies their shape.

## Pre-launch gates (fixed regardless of how phases are shaped)

- DECISIONS.md N8 RESOLVED before any page naming a specific lender goes live.
- Independent content review (point 14) completed on all public copy.
- Environment check (point 8): run on every OS in the CLAUDE.md table.
- The email form goes live only once the free checklist it promises exists (N37).
- GUIDE_URL stays unset until the ₱99 guide and its payment link exist (N38).
- Any constraint that passed before a feature touched its surface is re-verified (point 11).
- `npm run launch-check` passes: the privacy page, the verdict wording and the cap values are
  signed in SIGNOFF.json, and none has changed since (point 10). Status 2026-09-24: all three
  are signed, cap-values (6767484), verdict-wording (a46bb31) and the v1 privacy page (8dcd45b),
  and `launch-check` passes.

## Final phase — Retro (point 17) — mandatory

After launch, before calling the build done:

- What actually broke during the build (not what the plan predicted)
- What caught each thing
- What would have caught it sooner
- Fold the answers into CLAUDE.md → Lessons, and into docs/BUILD-STANDARD.md as new numbered
  points if they're general.
