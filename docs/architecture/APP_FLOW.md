# App Flow

## Entry routes

Placeholder pending `/lp-shape-section` confirmation per section:

- `/` — homepage
- `/validator` — interactive in-browser `.ulc.json` validator
- `/spec` — rendered spec content (authoring patterns, schema, taxonomy, templates, PIM guides)
- `/why-publish` — manufacturer value-prop, ROI, PIM integration paths
- `/governance` — stewardship, decision process, industry-body dialogue, pilots
- `/downloads` — pass-through to GitHub Releases for the Go reference CLI validator

## Primary user journeys

One journey per audience, matching PRD.md "Users":

- **Manufacturer product-data lead (PRIMARY)** — Arrives via search ("ULC luminaire spec"), industry-body referral, or a colleague's link. Lands on `/`. Reads the hero ("publish `.ulc.json` alongside your datasheet — AI agents can consume your products directly"). Clicks the prominent **"Try the validator"** CTA → `/validator`. Drops a candidate `.ulc.json` they've assembled from a PIM export. Sees pass/fail with line-anchored errors. If PASS: jumps to `/why-publish` to read ROI + PIM integration paths, then exits to the spec repo to commit. If FAIL: reads validator errors, returns to `/spec` for the relevant authoring pattern, fixes, re-drops.

- **Specifier / lighting designer** — Arrives via industry-body link or designer-community post. Lands on `/`. Quickly skims the hero — manufacturer-focused but the value prop ("structured data, faster comparisons") registers. Clicks through to `/spec` for a quick orientation. Exits to whatever tool they use day-to-day, now able to ask their tool vendor or favored manufacturer for ULC-format outputs.

- **Software vendor / AI tool builder** — Arrives via the ULC GitHub repo's homepage link. Lands on `/spec`. Reads authoring patterns A/B/C/D to understand the four real-world publishing shapes, then drills into schema reference + taxonomy + crosswalks to GLDF / ETIM / IES / EULUMDAT. Pulls the canonical example records from the spec repo. Exits back to GitHub to start implementing a reader.

- **Industry body (DIAL / IES / LIA)** — Arrives via direct reference from Foad or a peer-organization mention. Lands on `/governance`. Reads stewardship, decision process, change-proposal flow, current dialogue partners. Exits with a clearer picture of whether ULC is serious enough to engage with formally.

## Authentication flow

Not applicable. The site is fully public; there is no login surface.

## Navigation structure

Top navigation links to the five secondary entry routes: `/spec`, `/validator`, `/why-publish`, `/governance`, `/downloads`. The homepage anchors via `/`.

**Hero CTA hierarchy is unresolved** (brainstorm Open Question #1): validator-drop-as-hero converts technical evaluators fast but loses the marketing pitch; why-publish-as-hero converts decision-makers but adds a click before validation. **Default for v1: why-publish-led hero with a prominent secondary "Try the validator" CTA visible above the fold.** Revisit after the homepage section is shaped and we have observed visitor behavior in pilot rounds.

ASCII sketch of the journey graph:

```
       (search / referral)
              │
              ▼
              /  ───────────────► /validator ───► (try a file) ───► /spec (if fail)
              │                                          │           │
              ├──► /why-publish                          │           │
              │                                          ▼           ▼
              ├──► /spec ─────────────► (drill in)   /why-publish   /validator
              │
              ├──► /governance
              │
              └──► /downloads ───► GitHub Releases (Go CLI)
```

## Error & empty states

**Validator** (the only interactive surface):

- _No file dropped yet:_ idle drop zone with click-to-upload fallback and a short example explainer.
- _Non-JSON file dropped:_ "This doesn't look like JSON. Drop a `.ulc.json` file."
- _Malformed JSON:_ JSON parse error with line + column reference.
- _Schema validation failures:_ line-anchored error list, each linking to the relevant field reference in `/spec`.
- _Source files dropped without `.ulc.json`:_ "Drop the `.ulc.json` record first, then add the source PDF / IES / LDT files to verify hashes."
- _Hash mismatch on source-file verification:_ explicit "the PDF you dropped does not match the SHA-256 hash referenced in the record" message, no silent failure.

**Spec-content sync errors** surface at build time in CI — the build aborts and Cloudflare Pages continues serving the previous successful deploy until resolved. Users never see a half-built spec.

**Generic 404** for unknown routes — static `404.html` rendered by Astro with a link back to `/`.

