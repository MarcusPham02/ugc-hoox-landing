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
- [Mock Ups/styleguide.html](Mock Ups/styleguide.html) — standalone palette/typography reference page, not linked from the site.

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

3. **Forms + FAQ** ([form-handler.js](Mock Ups/js/form-handler.js)). FAQ accordion (`.question-item` → `.question-header` toggles), plus the contact form which posts to **Netlify Forms** (the form HTML must keep the `data-netlify` / `name` attributes Netlify expects).

## Design tokens — known mismatch

The palette is **"Indigo Clean"** (primary `#5A57F2` with mint accents), but the CSS variable *names* in [main.css](Mock Ups/css/main.css) `:root` still reflect the old blue palette — `--accent-blue` now holds the indigo `#5A57F2`, `--accent-dark` is `#5A57F2` too, etc. Token rename is pending. When editing colors, change the **value** under the existing name; don't introduce a new variable just because the name reads wrong.

## Section model — the four pillars

Marketing copy across the site (hero subtext, About cards 01–04, demo tabs, Features deck, pricing copy) all reference the same four pillars in the same order: **Pitch to Brands → Hook Analyzer → Creator Community → Batch & Calendar**. Reordering or renaming a pillar means updating all of those locations together, not just the section you're editing.

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
