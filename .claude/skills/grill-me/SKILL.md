---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

# Grill Me

Grill-then-build. For each phase: interrogate the plan until there is genuine
shared understanding, then implement that phase only after the user signs off.
This skill spans both planning and execution.

## Hard Rules

- **Supabase:** You MAY write app-side code that calls Supabase (queries,
  client SDK). You MUST NOT touch schema, migrations, or server/infra config.
  If a phase needs DDL or infra changes, STOP and hand the user exact steps.
- Always grill until shared understanding is reached — no hand-waving.
- Never advance past a phase until Gate B is cleared.
- The user defines the phases. Never invent a phase breakdown. If a phase is
  unclear, ask — but do not propose your own list.

## Per-Phase Flow

Repeat for every phase the user has defined.

1. **State the phase** — Name the phase and confirm which phase we are in.

2. **Gate A — plan grill** — Lay out the approach for this phase. The user
   interrogates it; resolve every branch of the decision tree. Write NO code
   until the user approves the plan.

3. **Implement** — Implement only this phase's scope. Do not touch other phases
   or work beyond this phase.

4. **Review + edge cases** — Give a quick overview of what was implemented,
   then surface edge cases. **Severity bar:** only edge cases that break core
   functionality force a re-loop of this phase. Log cosmetic or rare edge cases
   and defer them automatically.

5. **Gate B — confirm & advance** — The user confirms. Commit and push (the
   push is bookkeeping, not the approval signal — the user's confirmation is).
   Then advance to the next phase and repeat until all phases are done.
