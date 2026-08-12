# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static landing page for **UGC Hoox** (also branded "UGX HOOX" / "UGC Rights" in older copy) — a marketing site for a UGC creator platform built around four pillars: Pitch to Brands, Hook Analyzer, Creator Community, Batch & Calendar. No backend, no build step, no framework. Vanilla HTML + CSS + JS, deployed to Netlify.

## Layout

All shippable assets live in [Mock Ups/](Mock Ups/) — **the folder name contains a space, so quote paths in shell commands** (`"Mock Ups/index.html"`). Netlify publishes from this directory (see [Mock Ups/netlify.toml](Mock Ups/netlify.toml) — `publish = "."`).

- [Mock Ups/index.html](Mock Ups/index.html) — single-page site. Sections in order: `#hero`, `#about`, `#how-it-works`, `#features`, `#pricing`, `#questionnaire`, `#contact`. Nav `<a href="#…">` targets match these IDs.
- [Mock Ups/css/main.css](Mock Ups/css/main.css) — CSS custom-property tokens (`:root`), typography, resets.
- [Mock Ups/css/components.css](Mock Ups/css/components.css) — section/component styles. By far the largest file (~1700 lines).
- [Mock Ups/css/animations.css](Mock Ups/css/animations.css) — keyframes + `.reveal` / `.reveal-scale` transition rules.
- [Mock Ups/css/responsive.css](Mock Ups/css/responsive.css) — media queries (mobile-first).
- [Mock Ups/js/scroll-reveal.js](Mock Ups/js/scroll-reveal.js), [Mock Ups/js/demo-interactive.js](Mock Ups/js/demo-interactive.js), [Mock Ups/js/form-handler.js](Mock Ups/js/form-handler.js) — three independent IIFE-wrapped vanilla JS modules loaded in that order at the bottom of `index.html`. No bundler; no imports between them.

## Running locally

No build. Either:

```sh
open "Mock Ups/index.html"
```

…or serve so relative paths work cleanly (recommended for testing scroll reveal and form behavior):

```sh
cd "Mock Ups" && python3 -m http.server 8000
```

Then visit `http://localhost:8000`. There are no tests, no linter, no package.json.

## How the page wires together

Three orthogonal JS systems, each scoped via IIFE:

1. **Scroll reveal** ([scroll-reveal.js](Mock Ups/js/scroll-reveal.js)). An `IntersectionObserver` adds `.active` to any element with class `.reveal` / `.reveal-scale` once 15% is visible. By default each element animates once (`config.once = true`). If a new section isn't appearing on scroll, the most common cause is a missing `.reveal*` class.

2. **Interactive demo** ([demo-interactive.js](Mock Ups/js/demo-interactive.js)). The "See It In Action" section is a tabbed UI (`.demo-tab` controls `.demo-panel`). Only the **Hook Analyzer** panel is fully interactive — clicking a `.sample-chip` picks one of the `HOOK_SAMPLES` mock entries (preset text + suggestion + 4 scores) and animates four `.mini-score-fill` bars keyed by `creativity / emotion / cta / punch`. The Pitch / Community / Calendar panels are static previews with a one-shot reveal on tab switch. There is no real AI call — adding one means replacing `HOOK_SAMPLES` lookup with a fetch.

3. **Forms + FAQ** ([form-handler.js](Mock Ups/js/form-handler.js)). FAQ accordion (`.question-item` → `.question-header` toggles), plus the `#contact` waitlist form. On submit it fires **two destinations in parallel** via `Promise.allSettled` — **Netlify Forms** (URL-encoded POST) and a **Supabase** `waitlist` insert — and shows success if *either* resolves (error only if both fail). The form HTML must keep the `data-netlify` / `name` / `form-name` / honeypot attributes Netlify expects. See "Form submission & deploy" below.

## Design tokens — known mismatch

The palette is **"Sunset Orange"** (primary `#F97316` with a mint accent), but the CSS variable *names* in [main.css](Mock Ups/css/main.css) `:root` still reflect the old blue palette — `--accent-blue` now holds the orange `#F97316`, `--accent-dark` holds `#EA580C`, etc. Token rename is pending. When editing colors, change the **value** under the existing name; don't introduce a new variable just because the name reads wrong.

## Form submission & deploy

The waitlist form writes to two places; the Supabase half depends on credentials **injected at deploy time**, so it only works on the deployed Netlify site, not from `file://` or a bare local server:

- `index.html` ships **placeholders** `window.SUPABASE_URL = 'YOUR_SUPABASE_URL'` / `window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'` in an inline `<script>`, plus the Supabase UMD CDN script. `form-handler.js`'s `getSupabaseClient()` treats the unreplaced placeholders as "not configured" and silently skips the Supabase insert (Netlify path still works).
- The [netlify.toml](Mock Ups/netlify.toml) **build `command`** `sed`-replaces those placeholders with the `$SUPABASE_URL` / `$SUPABASE_ANON_KEY` **environment variables** (set in Netlify site settings) before publish. Keep the placeholder strings byte-for-byte or the sed misses.
- Email notifications on signup are a **Netlify dashboard setting** (Forms → notifications), not code — nothing in the repo configures the recipient. Netlify only registers the form by parsing the deployed static HTML, so a submission must reach the live site to appear under Forms.
- Supabase `waitlist` table schema (name/email/message/created_at) and RLS notes are documented in the [form-handler.js](Mock Ups/js/form-handler.js) header comment.

## Subagent ownership model

This repo defines domain-scoped subagents in [.claude/agents/](.claude/agents/) with **non-overlapping file ownership** — respect the boundaries to avoid two agents fighting over the same file:

- **html-content** owns `Mock Ups/index.html` (structure, copy, four-pillar messaging, nav, Netlify form attributes).
- **css-design** owns `Mock Ups/css/*.css` (tokens, layout, responsive, the palette).
- **js-interactive** owns `Mock Ups/js/*.js` (scroll reveal, demo, accordion, form behavior).
- **email-form** owns the contact/waitlist form *across* markup + JS + `netlify.toml`, coordinating the two above.
- **qa-review** is **read-only** — accessibility, responsive, pillar-copy consistency, palette discrepancy, intact JS hooks. It reports; the owning agent fixes.

A markup change that needs a matching CSS/JS change should be flagged to that owner rather than edited cross-boundary. ([.claude/AGENT-TEAMS.md](.claude/AGENT-TEAMS.md) is the coordination reference.)

## Section model — pillars (primary + secondary)

The site now foregrounds three **primary** pillars — **Pitch to Brands → Hook Analyzer → Creator Community** (with script workshopping folded into Community) — and treats **Batch & Calendar** as a **secondary** feature. The hero subtext and Features section lead with the primary three; Calendar survives only on secondary surfaces (the demo **Calendar tab** and the **pricing copy**), so it's fine that the hero omits it — don't "fix" that back to four co-equal pillars.

The interactive demo still has four tabs (Pitch / Hook Analyzer / Community / Calendar) in that order — see [demo-interactive.js](Mock Ups/js/demo-interactive.js). Renaming or reordering a primary pillar still means updating hero subtext, demo tabs, and pricing together, not just one section.

## Original design brief

The original requirements doc the user wrote for this project:

- **Header:** Logo, ABOUT US, HOW IT WORKS, Pricing, CONTACT.
- **Body:**
  - Hero: a problem-attack quote / solution statement.
  - About Us: What is UGC Rights, What We Do, Why We Do.
  - How It Works: a text-input AI demo that scores hooks on **Creativity, Emotional Impact, Call To Action, Lengthy Punch** and returns a suggested improvement note.
  - Pricing: Free tier (5/day, 1 social account) and Premium tier (15/day, 1+ social accounts).
  - Questionnaire: 5 selectable add/drop questions about the app (now the FAQ accordion).
  - Contact footer: email form.
