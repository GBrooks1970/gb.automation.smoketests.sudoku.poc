# Migration Plans

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z.md)

**Reviewer:** AI assistant (GPT-5.3-Codex)

---

## Single Source of Truth for Features (Plan)

- Keep `DESIGN_Sudoku_Solver_Specification.md` as canonical behavior contract.
- Add explicit traceability map: spec section -> feature scenario -> implementation method.
- Make hidden-single scope a first compliance checkpoint after refactor.
- Add a lightweight doc-consistency checklist to PR templates.
- Add automated markdown link checking to prevent planning/reference drift.
- Require every backlog item to link to both risk source and implementation evidence.

## Docker Compose for Local Development (Plan)

- Start with one `typescript-solver` service (build + run + test commands).
- Add optional `watch` profile for developer iteration.
- Mount workspace volume and keep containerized node_modules isolated.
- Add future profiles for API and Web UI components once implemented.
- Use Compose as the local parity layer for eventual CI runners.
- Keep container setup minimal until multiple runtime services actually exist.

## GitHub Actions / Workflow (Plan and Status)

- **Current status:** no workflows present under `.github/workflows/`.
- Phase 1: build workflow (`npm ci`, `npm run build`) on push/PR.
- Phase 2: test workflow (`npm test`) once executable suite is in place.
- Phase 3: quality workflow (lint, format check, markdown links, npm audit).
- Phase 4: coverage report publication with threshold gates.
- Phase 5: optional release workflow for tagged builds once API/UI artifacts exist.

---

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z.md)
