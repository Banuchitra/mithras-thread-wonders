---
description: Review the current unit before opening a PR
---
Review the current branch against its unit plan in `aidlc/units/`.

1. Run lint, type-check, unit tests and e2e tests; report failures verbatim.
2. Launch the `reviewer` and `a11y-auditor` subagents in parallel on the diff vs `main`
   (and `content-checker` if `content/` changed). Give them the code, not your conclusions.
3. Check every acceptance criterion in the unit plan: met / not met, with evidence.
4. Summarise findings, most severe first. Fix only what I approve.
