---
description: Update the learning hub after a unit is merged
argument-hint: [unit id or topic]
---
Update the local learning hub (`learning/`) for **$ARGUMENTS** (or the most recently merged unit).

1. Find the matching topic page in `learning/pages/` (create it from the existing page structure if missing,
   and unlock its card on `learning/index.html`).
2. Each page keeps the sections: Concept → animated diagram (inline SVG/CSS) → How it's used in this repo
   (real file paths) → Try it (commands) → Learn more (official docs links; check they return 200) → Quiz.
3. Write in plain, friendly language for a learner. Add what was surprising or tricky in this unit.
4. Update the roadmap's current step on `learning/index.html`.
