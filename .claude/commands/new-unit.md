---
description: Plan a Construction unit (AIDLC) — e.g. /new-unit U2
argument-hint: <unit id, e.g. U2>
---
Plan unit **$ARGUMENTS** for this project.

1. Read `CLAUDE.md`, `aidlc/01-requirements.md`, `aidlc/02-design.md` (if present) and earlier unit files.
2. Ask me any open questions before planning (max 4 at a time).
3. Write `aidlc/units/$ARGUMENTS.md` with: goal, user stories covered, files to create/change,
   tests to write first, acceptance checks, learning-hub page to update, out-of-scope.
4. Stop and ask me to approve. After approval: create branch `unit/$ARGUMENTS-<short-name>`,
   write the tests first, then implement.
