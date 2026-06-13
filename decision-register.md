# Decision Register

**Project:** gb.automation.smoketests.sudoku.poc
**Last Updated:** 2026-06-12
**Governed by:** `reference-architecture.md` v1.14 §10.6
**Template:** `DOCS/.templates/decision-record.template.md`

> This register is the authoritative source for every structural and process decision in this project.
> Any rule restated in `CLAUDE.md`, stack documentation, or design documents defers to this file.
> Decisions are immutable once `Accepted` — they may only be `Superseded` by a newer entry that references the original by ID.

---

## Accepted Decisions

---

## DR-001 — Dot-prefix convention for DOCS subdirectories

**Date:** 2026-01-30
**Status:** Accepted — 2026-01-30

### Context

When the `DOCS/` directory was first structured, a visual convention was needed for type-specific subdirectories (design documents, planning, implementation logs, reviews). The team wanted directories to be visually distinct from individual document files and to sort predictably in file-explorer tools.

### Decision

All type-specific subdirectories inside `DOCS/` use a leading dot: `.analysis/`, `.algorithm/`, `.architecture/`, `.design/`, `.howto/`, `.implementation/`, `.implementation-logs/`, `.planning/`, `.review/`, `.templates/`. Future DOCS subdirectories follow the same pattern.

### Consequences

**Outcomes:**
- Directories sort before document files in most file-system tools (dot-first ordering).
- The leading dot provides an immediately recognisable visual marker in the DOCS tree.

**Trade-offs:**
- This convention is not prescribed by the Reference Architecture, which uses plain names (`algorithm/`, `planning/`, `implementation-logs/`). This is a documented divergence.
- New contributors must learn the convention explicitly — it is not standard in the wider community.

**Compliance note:**
- Documented divergence from `reference-architecture.md` §4 directory blueprint. Acceptable because the Reference Architecture explicitly permits MAY-level variation in folder naming beyond the structural roles it describes.

### Alternatives Considered

**Alternative: Plain names** (`design/`, `planning/`, `review/`)
- Description: Match the Reference Architecture exactly.
- Rejected because: Plain names sort intermixed with document files in file explorers, reducing scannability of the DOCS root.

**Alternative: UPPER_CASE** (`DESIGN/`, `PLANNING/`, `REVIEW/`)
- Description: Use all-caps to distinguish directory roles.
- Rejected because: Overly aggressive visually; inconsistent with the broader ecosystem convention for directory names.

### Related Decisions

- DR-005 — The dot-prefix directories house templates; this influenced template consolidation decisions.

---

## DR-002 — TypeScript + Cucumber.js as the BDD test stack for DEMOAPP001

**Date:** 2026-01-30
**Status:** Accepted — 2026-01-30

### Context

DEMOAPP001's subject application is written in TypeScript. A test framework was needed that supports BDD (Gherkin feature files as the specification layer), works natively with TypeScript, and can be extended to support the Screenplay pattern. The choice locked in the primary technology for all future Screenplay components in this Stack.

### Decision

Use `@cucumber/cucumber` v12+ with `ts-node` for step-definition execution as the BDD runner for DEMOAPP001. The future migration target is to layer in `@serenity-js/core` and `@serenity-js/cucumber` without changing the feature files.

### Consequences

**Outcomes:**
- Gherkin is the BDD specification language for all stacks; DEMOAPP001 is the reference implementation.
- TypeScript step definitions compile cleanly and share type information with the subject application.
- Serenity/JS can be added in Sprint 3 without altering the feature file.

**Trade-offs:**
- `@cucumber/cucumber` without Serenity/JS has limited reporting. Addressed in Sprint 3 (Phase 4 of migration plan).
- Step definitions compiled to JS in `tests/step_definitions/solver_steps.js` currently — TypeScript source should be the primary artefact.

**Compliance note:**
- Aligned with Reference Architecture §3 (Screenplay pattern) — Cucumber is the step-definition layer (Layer 2); Serenity/JS provides the Screenplay layer (Layer 3).

### Alternatives Considered

**Alternative: Jest with custom BDD helpers**
- Description: Write BDD-style tests using Jest's describe/it blocks with a custom Gherkin parser.
- Rejected because: No native Gherkin support; cannot share feature files with Python/C# stacks without duplication.

**Alternative: Playwright with Cucumber**
- Description: Use Playwright's browser automation with Cucumber for end-to-end testing.
- Rejected because: Premature for a CLI/util surface subject application; adds browser dependency unnecessarily.

**Alternative: Mocha + Chai**
- Description: Use Mocha as the test runner with BDD-style assertions.
- Rejected because: No native Gherkin support; step-to-scenario mapping is manual.

### Related Decisions

- DR-003 — The @util surface choice is compatible with Cucumber.js without a browser or process driver.

---

## DR-003 — In-process (@util) surface for DEMOAPP001 tests

**Date:** 2026-01-30
**Status:** Accepted — 2026-01-30

### Context

The subject application (`SudokuSolver`, `SudokuOrchestrator`, `SudokuCLI`) is a TypeScript CLI. Tests could either spawn the compiled binary and assert on stdout/stderr (a `@cli` surface in the Reference Architecture's taxonomy), or import the TypeScript classes directly in-process (a `@util` surface). Both approaches satisfy the Gherkin scenarios, but they have different coupling, speed, and lifecycle implications.

### Decision

DEMOAPP001 tests import TypeScript classes directly in-process. In the Reference Architecture tag taxonomy (§5.3), all scenarios in this stack are tagged `@util`. No process lifecycle management is required. A separate future `@cli` Stack may be added independently.

### Consequences

**Outcomes:**
- Tests run fast (no compilation round-trip, no process spawn overhead).
- Error messages include TypeScript stack traces — significantly more informative than stdout/stderr diffs.
- The Ability layer (`UseSudokuSolver`) wraps TypeScript classes directly, which is the natural boundary.

**Trade-offs:**
- The CLI surface contract (exit codes, stdout/stderr separation, timeout) is not tested by this stack.
- A gap exists between what the tests exercise and what an end-user of the compiled binary experiences.

**Compliance note:**
- Aligned with Reference Architecture §5.3 (`@util` tag) and §9.1 (CLI surface lifecycle — not required for @util scenarios).

### Alternatives Considered

**Alternative: @cli surface (spawn process)**
- Description: Compile the application to `dist/`, spawn it via `child_process.spawn()`, capture stdout/stderr, assert on output.
- Rejected for this stack: Slower, harder to debug, requires the CLI surface contract (exit codes, stderr) to be formally specified first. Deferred to a future `@cli` Stack.

**Alternative: Mixed surface (in-process + CLI verification)**
- Description: Run algorithms in-process but verify results via CLI output.
- Rejected because: Creates two sources of truth for the same assertion; coupling without benefit.

### Related Decisions

- DR-002 — Cucumber.js is well-suited to @util surface testing.
- DR-004 — A future @cli Stack may be added as part of the multi-stack parity plan.

---

## DR-004 — Sequential Stack migration strategy (TypeScript → Python → C#)

**Date:** 2026-05-14
**Status:** Accepted — 2026-05-14

### Context

The Reference Architecture's multi-stack parity model requires multiple Stacks sharing the same canonical feature files. The project plans TypeScript (existing), Python, and C# Stacks. A decision was needed on whether to build all Stacks in parallel or sequentially, and in what order.

### Decision

The TypeScript Stack (DEMOAPP001) is implemented first and serves as the reference implementation for Memory key constants and Screenplay component signatures. Python follows in Sprint 4; C# in Sprint 5. Each Stack is validated against the parity contract before the next begins.

### Consequences

**Outcomes:**
- TypeScript implementation establishes the canonical Memory keys and component signatures that all subsequent Stacks must match.
- Each Stack can be fully validated in isolation before the next Stack is added.
- Parity defects are detected early (two-Stack comparison is simpler than three-Stack).

**Trade-offs:**
- Multi-stack parity cannot be formally verified until Sprint 4 (two Stacks exist).
- Python and C# teams (if separate) must wait for the TypeScript reference to be complete.

**Compliance note:**
- Aligned with Reference Architecture §8 (Multi-Stack Parity Rules) and §11 (Onboarding a New Stack checklist).

### Alternatives Considered

**Alternative: All Stacks in parallel**
- Description: Implement TypeScript, Python, and C# simultaneously in Sprint 3.
- Rejected because: No reference implementation to conform to; parity rules cannot be applied until at least one Stack is complete. Resource constraint.

**Alternative: Two Stacks only (TypeScript + Python, skip C#)**
- Description: Implement only TypeScript and Python, treating C# as out of scope.
- Status: Deferred decision — not rejected. C# Stack remains on the roadmap pending Sprint 5 planning.

### Related Decisions

- DR-003 — The @util surface decision applies to all planned Stacks (TypeScript, Python, C#).
- DR-005 — Feature files remain unchanged, making them immediately usable by future Stacks.

---

## DR-005 — Feature file unchanged during Screenplay migration

**Date:** 2026-05-14
**Status:** Accepted — 2026-05-14

### Context

The Screenplay migration (Phases 2–4 of the migration plan documented in `DOCS/.analysis/ref-arch-alignment_2026-05-14.md`) replaces procedural step definitions with Screenplay components. A question arose: should the Gherkin feature file also be refactored at the same time? The feature file has some over-specified steps (inline array values) that would ideally be parameterised.

### Decision

All 43 Gherkin scenarios in `BasicSudokuSolverLogic.feature` remain unchanged during the Screenplay migration. The migration is a refactor of the test implementation layer (Layers 2–4) only. Over-specified step text is addressed in a separate, subsequent backlog item (NEW-012) after the Screenplay layer is stable.

### Consequences

**Outcomes:**
- Zero regression in the behavioural specification during migration.
- Step definition migration can be verified by diffing Cucumber output before and after migration.
- The feature file is immediately usable as the canonical source for `features-shared/` (Phase 1 of migration).

**Trade-offs:**
- Some over-specified steps (e.g., `Given a row contains the values [1, 2, 0, 4, 5, 6, 7, 8, 9]`) are carried into the Screenplay layer unchanged. They must be refactored in a follow-up item.
- The Screenplay step definitions inherit the current step text shapes, including the non-ideal ones.

**Compliance note:**
- Aligned with Reference Architecture §5.4 (step definition shape — over-specified steps should be refactored, but this is addressed post-migration).

### Alternatives Considered

**Alternative: Refactor feature file during Screenplay migration**
- Description: Simultaneously parameterise over-specified steps and migrate the step definitions.
- Rejected because: Two simultaneous changes make regression harder to diagnose. A failing scenario after the combined change could be caused by either the step text change or the Screenplay implementation — impossible to isolate.

**Alternative: Refactor feature file first, then migrate step definitions**
- Description: Parameterise steps in a separate commit before beginning Screenplay implementation.
- Status: Partially viable — deferred to NEW-012. The risk is that step text changes require updating `solver_steps.js` before it is deleted, which adds churn to a file that is about to be replaced.

### Related Decisions

- DR-002 — Cucumber.js is used for the pre- and post-migration test runs.
- DR-004 — The unchanged feature file can be propagated directly to Python and C# Stacks when they are onboarded.

---

## DR-006 — Adopt Reference Architecture v1.1 and correct Phase 0 document paths

**Date:** 2026-05-14
**Status:** Accepted — 2026-05-14

### Context

The Reference Architecture was updated from v1.0 to v1.1 on 2026-05-14. Two path requirements changed: the backlog document moved from a root-level requirement to `DOCS/.planning/backlog.md`, and `naming-conventions.md` was pinned from "root or DOCS/" to specifically `DOCS/.design/naming-conventions.md`. Phase 0 had already been executed against v1.0, placing both documents at the wrong paths.

### Decision

Adopt RA v1.1 as the governing version. Correct the two path errors introduced by Phase 0:
1. Move `naming-conventions.md` from repository root to `DOCS/.design/naming-conventions.md` (applying the DR-001 dot-prefix convention to the RA's `DOCS/design/` requirement).
2. Demote the root backlog document from a required document to a convenience summary redirect; the required document is `DOCS/.planning/backlog.md`, which already existed before Phase 0.

### Consequences

**Outcomes:**
- The project is now governed by RA v1.1, which is more specific about document paths.
- `naming-conventions.md` is co-located with design documents in `DOCS/.design/`, consistent with DR-001.
- `DOCS/.planning/backlog.md` remains the single authoritative backlog.

**Trade-offs:**
- The root backlog redirect created in Phase 0 is now non-required. It must include a clear redirect to `DOCS/.planning/backlog.md` to avoid confusion.
- Any external links or CLAUDE.md references that pointed to root `naming-conventions.md` must be updated.

**Compliance note:**
- `DOCS/.design/naming-conventions.md` maps to the RA v1.1 requirement `DOCS/.design/naming-conventions.md` via DR-001 (dot-prefix convention).

### Alternatives Considered

**Alternative: Continue under v1.0**
- Description: Do not adopt v1.1; keep documents at v1.0 paths.
- Rejected because: v1.1 is the accepted version of the governing architecture. Using a superseded version would invalidate the compliance roadmap.

**Alternative: Move documents to RA-literal paths (no dot-prefix)**
- Description: Place files at `DOCS/.design/naming-conventions.md` literally, without dot-prefix.
- Rejected because: DR-001 is an accepted decision. Introducing a single non-dot-prefixed DOCS subdirectory would create inconsistency within the DOCS tree.

### Related Decisions

- DR-001 — Dot-prefix convention applied to map `DOCS/design/` → `DOCS/.design/`
- DR-005 — naming-conventions.md content derived from work done under Phase 0

---

## DR-007 — Establish features-shared/ as the Canonical Feature Store

**Date:** 2026-05-14
**Status:** Accepted — 2026-05-14

### Context

Phase 1 of the Reference Architecture migration required creating a Canonical Feature Store at `features-shared/` (RA §5.1). The sole feature file previously lived at `demo-apps/demoapp001-typescript-cypress/tests/BasicSudokuSolverLogic.feature`, owned by the Stack rather than by a shared store. With a second Stack (Python, C#) planned, an authoritative single source of truth was needed before adding any further Stack.

### Decision

Create `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` as the canonical source. Tag it with `@util` at Feature level (surface tag only, per RA §5.3). Create a Stack-local copy at `demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature` with additional `@stack-demoapp001` tag. Update `cucumber.js` to read from `tests/features/` only. Remove the old `tests/BasicSudokuSolverLogic.feature`.

### Consequences

**Outcomes:**
- A canonical Canonical Feature Store exists at `features-shared/`. Future Stacks copy from here.
- The Stack-local file is the only file Cucumber reads; it carries both the surface tag and the Stack tag.
- The `@util` surface tag is applied to all 43 scenarios via Feature-level tagging, enabling future tag-filtered runs.
- `@stack-demoapp001` identifies scenarios that have been implemented in this Stack, supporting future parity gap tracking.

**Trade-offs:**
- Two files must be kept in sync when scenarios change. The canonical feature update procedure in `CLAUDE.md` governs this.
- The `features-shared/` path structure (`util-tests/sudoku-solver/`) must be maintained consistently when future feature groups are added.

**Compliance note:**
- Fully aligned with RA v1.1 §5.1 (single source of truth), §5.2 (feature distribution), §5.3 (tag taxonomy).

### Alternatives Considered

**Alternative: Symlink tests/features/ to features-shared/**
- Description: Use a filesystem symlink so there is only one physical file.
- Rejected because: Symlinks have cross-platform issues (Windows requires elevated permissions) and obscure the intent of the Stack-local copy bearing Stack-specific tags.

**Alternative: Keep feature file inside the Stack, defer features-shared/ to multi-stack phase**
- Description: Do not create features-shared/ until a second Stack is ready.
- Rejected because: Creating the canonical store now establishes the correct structure before habits form. Retrofitting after two Stacks exist is harder and risks parity drift.

### Related Decisions

- DR-003 — @util surface confirmed; feature file tagged accordingly
- DR-005 — feature file content unchanged (43 scenarios identical); only tags and path changed

---

## DR-008 — Serenity/JS integration: extends Ability, remove static as() override

**Date:** 2026-05-14
**Status:** Accepted — 2026-05-14

### Context

The Screenplay migration design (`screenplay-migration.md`) was authored against an earlier version of Serenity/JS. When implementing Phase 2 against the installed version (3.43.2), two deviations from the design were required due to API changes in the library.

### Decision

1. **`extends Ability` not `implements Ability`:** In Serenity/JS 3.43.2, `Ability` is a base class with a protected constructor, `toJSON()`, and `abilityType` already implemented. Custom ability classes must `extends Ability` and call `super()` in their public constructor. Using `implements Ability` results in a TypeScript error about missing properties.
2. **Remove custom `static as()` override:** The base `Ability` class provides a generic `static as<S extends Ability>(this: AbilityType<S>, actor: UsesAbilities): S` method that correctly returns the concrete type. Defining `static as(actor: Actor): UseSudokuSolver` in the subclass conflicts with the base class signature. Removing the override allows the inherited method to work correctly; `UseSudokuSolver.as(actor)` returns `UseSudokuSolver` via TypeScript's generic inference.
3. **Import paths corrected:** Design doc showed `../../app_src/` from the abilities directory; the correct depth is `../../../app_src/` given the `tests/screenplay/abilities/` nesting.

### Consequences

**Outcomes:**
- Both Ability classes compile cleanly with Serenity/JS 3.43.2.
- `UseSudokuSolver.as(actor)` and `LoadPuzzles.as(actor)` work correctly in Tasks via inherited generics.
- The `configure()` approach (in `support/configure.ts`) registers the Cast with Serenity/JS before scenarios run.

**Trade-offs:**
- Any future update of `@serenity-js/core` beyond 3.x may require revisiting the base class API.

**Compliance note:**
- `screenplay-migration.md` should be updated to reflect the `extends Ability` pattern and path corrections (post-Phase-4 clean-up task).

### Alternatives Considered

**Alternative: Pin @serenity-js/core to an older version matching the design doc**
- Description: Install an earlier 3.x version where `Ability` was an interface.
- Rejected because: Using outdated versions accumulates security debt and distances from the supported API surface.

### Related Decisions

- DR-002 — TypeScript + Cucumber.js Stack choice; Serenity/JS is the migration target
- DR-003 — @util surface; Abilities wrap in-process classes, not CLI or HTTP clients

---

## DR-009 — Adopt Reference Architecture v1.2 and normalize governance documents

**Date:** 2026-05-15
**Status:** Accepted — 2026-05-15

### Context

The Reference Architecture was updated to v1.2 on 2026-05-15. This version introduces tightened requirements around template naming (Appendix A), backlog status taxonomy (Section 10.1), results archival behavior (Section 9.3), review output shape and naming (Section 10.7), and decision register entries for extension patterns (referencing DR-012).

Phase 0–8 of the migration plan (as documented in prior alignment reports) was authored and executed against v1.1. The v1.2 update re-opens governance work to bring the project into alignment with the new, more prescriptive requirements.

### Decision

Adopt reference-architecture.md v1.2 (2026-05-15) as the governing architecture. Execute normalization work across four domains:

1. **Template filename contract:** Create all required Appendix A lower-case template filenames under DOCS/templates (now DOCS/.templates per DR-019).
2. **Backlog status taxonomy:** Normalize all backlog items to use exactly `Open`, `In Progress`, or `Resolved` statuses.
3. **Review decision lineage:** Add decision entry for review output shape and multi-file bundle naming strategy (provisional DR-012 placeholder until v1.2 semantics are fully implemented).
4. **Results archival behavior:** Update orchestration script to preserve markdown summary files when purging old logs, per Section 9.3 mandate.

### Consequences

**Outcomes:**
- Project governance is now compliant with v1.2 normative language.
- New Stacks (Python, C#) onboarded after this decision will work against v1.2 baseline, not a mixed v1.1/v1.2 state.
- Template naming is predictable and automatable for tooling and agents.
- Backlog status values are consistent and queryable.

**Trade-offs:**
- Phase A–D migration effort required to normalize existing documents.
- Any external references to prior uppercase template names must be updated.

**Compliance note:**
- v1.2 explicitly allows dot-prefix convention divergence at the "MAY vary" level of directory naming (Section 4 blueprint note). This project's use of DR-001 dot-prefixed DOCS subdirectories remains compliant via the existing decision.

### Alternatives Considered

**Alternative: Continue under v1.1 for this Stack only**
- Description: Defer v1.2 adoption until Stack 2 onboarding.
- Rejected because: Delaying normalization accumulates debt. v1.2 is the accepted current version; working against a superseded version creates unnecessary divergence.

**Alternative: Adopt v1.2 statement-only without backlog work**
- Description: Record the adoption but do not execute normalization phases.
- Rejected because: Compliance requires actual alignment, not ceremonial declaration.

### Related Decisions

- DR-001 — Dot-prefix convention for DOCS subdirectories remains compliant under v1.2 MAY-level directory naming latitude.
- DR-004 — Sequential Stack migration strategy; v1.2 adoption now ensures Python Stack onboarding (Stack 2) uses modern baseline.

---

## DR-010 — Code review directory placement under DOCS/.review with dot-prefix convention

**Date:** 2026-05-15
**Status:** Superseded by DR-014 -- 2026-05-16

### Context

Reference Architecture v1.2 §10.7 specifies that code review outputs may be stored in either a repository-root `.review/` directory or a project-specific location. The project currently maintains reviews under `DOCS/.review/`, which is a divergence from the RA v1.2 default root location.

This decision formalizes the location choice and applies the previously-accepted DR-001 dot-prefix convention. The choice prioritizes co-location of all project documentation (all reviews alongside design docs, implementation logs, and planning artifacts) over literal RA v1.2 directory naming.

### Decision

Code review outputs remain under `DOCS/.review/` rather than migrating to repository root `.review/`. This placement is justified by:

1. **Consistency with DR-001:** The dot-prefix convention (established in Phase 0) is applied to all DOCS subdirectories. `DOCS/.review/` is the natural extension of this pattern.
2. **Documentation co-location:** All project governance and review outputs are unified under DOCS, making the documentation tree self-contained.
3. **No functional impact:** Review output naming, shape, and file structure remain compliant with v1.2 §10.7 regardless of parent directory location.

Future code review output files **MUST** follow the v1.2-compliant naming and bundling scheme:
- Directory name: `CODE_REVIEW_{Reviewer}__{UTC_TIMESTAMP}/` (timestamp format: YYYYMMDDTHHMMZ)
- Required files: 00_INDEX.md, 01_EXECUTIVE_SUMMARY.md, 02_RISKS_AND_ISSUES.md, 03_PROJECT_REVIEWS/, 04_CROSS_PROJECT_ANALYSIS.md, 05_RECOMMENDATIONS.md, 06_ARCHITECTURE_ASSESSMENT.md, 07_MIGRATION_PLANS.md
- Multi-file bundle extension: Deferred to DR-012 (provisional — semantics TBD for Stack-specific review extensions)

### Consequences

**Outcomes:**
- Review directory placement is now formally recorded as a deliberate divergence from RA v1.2 default.
- Future reviews generated will follow v1.2 shape compliance regardless of this location decision.
- Documentation tree remains unified and discoverable under DOCS.
- Superseded by DR-014 (2026-05-16): future review outputs moved to repository-root `.review/`.
- DR-014 was later superseded by DR-029 (2026-05-20): `DOCS/.review/` is again the single authoritative review output location.

**Trade-offs:**
- Code review directory does not sit at repository root `.review/` as RA v1.2 example shows (MAY-level latitude — not a MUST requirement).
- Automated tooling that assumes root `.review/` would need configuration adjustment. No such tooling is currently integrated.

**Compliance note:**
- This is an accepted and documented divergence at the MAY-level of RA v1.2 §10.7. The decision preserves compliance with the normative MUST requirements (output shape and naming format) while diverging on location via the MAY-level latitude clause.

### Alternatives Considered

**Alternative: Migrate reviews to root `.review/`**
- Description: Move all existing DOCS/.review/ contents to root `.review/`, then update CLAUDE.md and CI references.
- Rejected because: Introduces directory-level divergence from established DR-001 pattern without functional benefit. Co-location of all documentation under DOCS is more valuable than RA v1.2 example path matching.

**Alternative: Use both locations (root and DOCS)**
- Description: Keep existing reviews at DOCS/.review and add new reviews to root `.review/`, migrating over time.
- Rejected because: Creates inconsistency and two sources of truth for where reviews live. Better to formalize one location.

### Related Decisions

- DR-001 — Dot-prefix convention for DOCS subdirectories applied consistently.
- DR-009 — v1.2 adoption implies this location decision must be explicitly recorded.

---

## DR-011 — Code review output shape and multi-file bundle strategy aligned to RA v1.2

**Date:** 2026-05-15
**Status:** Accepted — 2026-05-15

### Context

Reference Architecture v1.2 §10.7 specifies accepted shapes for code review outputs and references "DR-012" as the formal decision governing multi-file bundle extensions (for Stack-specific or specialized review types). The project currently produces reviews following the template shape defined in v1.2 Appendix A (`code-review.template.md`), but this decision was not explicitly recorded in the decision register.

This decision formalizes the commitment to v1.2 shape compliance and records the multi-file bundle strategy for future Stack-specific reviews (e.g., Stack 2 Python review outputs, Stack 3 C# review outputs).

### Decision

All code review outputs **MUST** follow the RA v1.2 shape specified in `code-review.template.md`:

**Required output directory:** `DOCS/.review/CODE_REVIEW_{Reviewer}__{UTC_TIMESTAMP}/`

**Required files (all MUST be present):**
1. `00_CODE_REVIEW_{Reviewer}__{UTC_TIMESTAMP}.md` — Index and metadata
2. `01_EXECUTIVE_SUMMARY.md` — Grade, dimension breakdown, key strengths, key risks
3. `02_RISKS_AND_ISSUES.md` — Numbered issues high-to-low priority
4. `03_PROJECT_REVIEWS/` — One .md file per project reviewed
5. `04_CROSS_PROJECT_ANALYSIS.md` — Parity, documentation, test coverage metrics
6. `05_RECOMMENDATIONS.md` — Prioritized improvements with backlog references
7. `06_ARCHITECTURE_ASSESSMENT.md` — SOLID/KISS/YAGNI/DRY assessment
8. `07_MIGRATION_PLANS.md` — Priority strategies with effort/risk

**Timestamp format:** UTC, `YYYYMMDDTHHMMZ` (no seconds; zero-padded)

**Reviewer attribution:** `AI assistant (CLAUDE [model])` or `[First name, Role]`

**Multi-file bundle extension strategy (DR-012 semantics):**
When reviews are specialized by Stack or surface type (e.g., Stack-specific code review for Python implementation), the bundle MAY be extended with:
- Subdirectory: `03_PROJECT_REVIEWS/` remains present and contains Stack-agnostic analysis
- New subdirectory: `STACK_SPECIFIC_REVIEWS/` MAY be added containing Stack-specific `.md` files
- File naming: `STACK_{StackName}_{AnalysisType}.md`
- Example: `STACK_DEMOAPP002_PYTHON_SCREENPLAY_PARITY_ANALYSIS.md`

This extension is provisional and subject to refinement as Stacks 2 and 3 are onboarded.

### Consequences

**Outcomes:**
- All code review outputs are now formally required to meet v1.2 shape specification.
- The multi-file bundle structure provides flexibility for Stack-specific analysis without breaking the standard shape.
- Future reviews can include Stack-specific findings without fragmenting the review output.

**Trade-offs:**
- The bundle shape is prescriptive; reviewers must follow the exact file naming and structure.
- Stack-specific extensions are deferred; they will be refined when Stack 2 (Python) review is generated.

**Compliance note:**
- Fully aligned with RA v1.2 §10.7. This decision serves as the project's formal recording of "DR-012 semantics" referenced in the RA.

### Alternatives Considered

**Alternative: Create single-file review documents**
- Description: Output reviews as single `CODE_REVIEW_{Reviewer}__{UTC_TIMESTAMP}.md` files instead of bundled directories.
- Rejected because: The multi-file structure enables cleaner organization, section-specific linking, and easier updates to individual sections (e.g., new risks, updated recommendations).

**Alternative: Extend RA v1.2 shape beyond what is specified**
- Description: Add custom sections (e.g., Sprint-specific analysis, Team feedback).
- Rejected because: v1.2 shape is the baseline. Custom sections should be added only after multi-Stack experience demonstrates a clear need.

### Related Decisions

- DR-010 — Code review directory location (DOCS/.review vs root); this decision is orthogonal to shape compliance.
- DR-009 — v1.2 adoption; this decision operationalizes §10.7 shape requirements.

---

## DR-012 — Adopt RA v1.3 and review bundle convention

### Context [REQUIRED]

`reference-architecture.md` was updated to v1.3 on 2026-05-15. The v1.3 update makes the repository-root code review directory requirement explicit and states that the multi-file review bundle convention is recorded in the Decision Register as DR-012. Without this decision, the project would continue to claim alignment through v1.2-era entries while the current accepted architecture requires v1.3 governance and DR-012 provenance.

### Decision [REQUIRED]

Adopt `reference-architecture.md` v1.3 as the governing architecture for this repository. Use DR-012 as the authoritative decision for future multi-file code review bundle naming: future comprehensive review bundles MUST use `.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/` with a main index file named `00_CODE_REVIEW_[AGENT]_v[N]_[UTC].md`, where `[UTC]` uses `YYYYMMDDTHHMMZ`.

### Status [REQUIRED]

`Accepted` — 2026-05-15

### Consequences [REQUIRED]

**Outcomes:**
- v1.3 is now the active reference architecture baseline for all repository governance work.
- DR-012 now exists as the required provenance entry for multi-file review bundle naming.
- Future review outputs have an unambiguous v1.3 naming target.

**Trade-offs:**
- Existing historical review bundles remain in their original v1.2-era names to preserve read-only review history.
- A follow-up migration is required to provide the repository-root `.review/` or `code-review/` location expected by v1.3.
- Agent guidance and planning documents must be refreshed so they no longer present v1.2 as the current baseline.

**Compliance note:**
- This decision satisfies the v1.3 §10.7 requirement that the multi-file review bundle convention be recorded as DR-012.
- DR-009 remains historical provenance for v1.2 adoption; DR-012 supersedes it as the active architecture version baseline.
- DR-011 remains historical provenance for the v1.2 review bundle shape; DR-012 is authoritative for future v1.3 review bundle names.
- DR-029 supersedes the root `.review/` location implied by this decision; the bundle naming shape remains active.

### Alternatives Considered [REQUIRED]

**Alternative: Keep DR-011 as the review bundle authority**
- Description: Continue treating DR-011 as the governing review output decision and avoid adding a new DR-012 entry.
- Rejected because: v1.3 explicitly names DR-012 as the recorded extension for multi-file review bundles.

**Alternative: Rename historical review bundles immediately**
- Description: Move and rename all existing review bundle directories to the v1.3 naming convention.
- Rejected because: review outputs are read-only once written. Historical bundle names should remain intact, with v1.3 applied to future outputs and compatibility locations.

### Related Decisions

- DR-009 — Historical adoption of `reference-architecture.md` v1.2.
- DR-010 — Historical review directory placement under `DOCS/.review/`.
- DR-011 — Historical v1.2 review bundle shape.

---

## DR-013 — Add RA-literal DOCS compatibility paths
**Superseded by:** DR-019 (2026-05-16) — bridge directories removed; dot-prefix convention extended to all DOCS subdirectories

### Context [REQUIRED]

`reference-architecture.md` v1.3 requires literal documentation paths such as `DOCS/.planning/backlog.md`, `DOCS/.design/naming-conventions.md`, and `DOCS/.implementation-logs/`. This repository already has accepted historical dot-prefixed documentation directories under DR-001: `DOCS/.planning/`, `DOCS/.design/`, and `DOCS/.implementation/`. Moving the authoritative documents immediately would create a broad path migration and risk breaking existing references while MIG-09 still needs to normalize implementation log policy.

### Decision [REQUIRED]

Keep the dot-prefixed DOCS directories as the authoritative content locations for existing planning, design, and implementation-log documents until a later decision supersedes this one. Add v1.3 literal compatibility paths that point agents and validators to the authoritative locations: `DOCS/.planning/backlog.md`, `DOCS/.design/naming-conventions.md`, and `DOCS/.implementation-logs/README.md`.

### Status [REQUIRED]

`Accepted` — 2026-05-15

### Consequences [REQUIRED]

**Outcomes:**
- Strict v1.3 path checks can find the required DOCS path roles.
- Existing links to dot-prefixed documentation continue to work.
- Future agents have explicit bridge files that identify the authoritative source of truth.

**Trade-offs:**
- The repository temporarily has both RA-literal compatibility paths and historical dot-prefixed authoritative paths.
- Bridge files must remain synchronized with any future relocation decision.
- A later migration is still required if the project chooses to make RA-literal directories fully authoritative.

**Compliance note:**
- This is a documented compatibility strategy for v1.3 Section 10.1, Section 10.8, and Section 10.9 path requirements.
- DR-001 remains the historical naming decision for dot-prefixed DOCS directories.

### Alternatives Considered [REQUIRED]

**Alternative: Move authoritative documents to literal v1.3 paths immediately**
- Description: Move `DOCS/.planning/backlog.md`, `DOCS/.design/naming-conventions.md`, and all `DOCS/.implementation/` logs into the v1.3 literal directories.
- Rejected because: This would mix a broad historical path migration into MIG-02 and would require updating many existing references before the implementation-log policy has been normalized.

**Alternative: Use filesystem symlinks**
- Description: Create symlinks from the v1.3 literal paths to the dot-prefixed directories.
- Rejected because: The repository is Windows-based and symlink creation can require elevated privileges or create portability issues across developer machines.

### Related Decisions

- DR-001 — Dot-prefix convention for DOCS subdirectories.
- DR-012 — Active v1.3 architecture baseline.

---

## DR-014 — Use root .review for future reviews

### Context [REQUIRED]

`reference-architecture.md` v1.3 requires a repository-root `code-review/` or `.review/` directory for code review outputs. Historical project reviews currently live under `DOCS/.review/` and use the earlier `CODE_REVIEW_{Reviewer}__{UTC_TIMESTAMP}` naming shape. Those historical review outputs are read-only snapshots, so renaming or moving them would rewrite provenance rather than improve future compliance.

### Decision [REQUIRED]

Create repository-root `.review/` as the v1.3 location for future code review outputs. Future comprehensive reviews MUST use `.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/` and include a main index named `00_CODE_REVIEW_[AGENT]_v[N]_[UTC].md`; historical reviews remain unchanged under `DOCS/.review/` and are treated as a read-only archive.

### Status [REQUIRED]

`Superseded by DR-029` — 2026-05-20

### Consequences [REQUIRED]

**Outcomes:**
- The repository now satisfies the v1.3 root review directory requirement.
- Future review naming is aligned with DR-012 and v1.3 Section 10.7.
- Historical review bundles remain intact and traceable.

**Trade-offs:**
- Review outputs now have a historical archive location and a future authoritative location.
- Agents must consult the root `.review/README.md` before creating new reviews.
- Existing links to `DOCS/.review/` remain valid but should be understood as historical, not the target for new reviews.
- Superseded by DR-029 (2026-05-20): review outputs now use `DOCS/.review/` as the single authoritative location; repository-root `.review/` is no longer used.

**Compliance note:**
- This decision implements the root `.review/` path accepted by v1.3 Section 10.7.
- DR-012 defines the future bundle naming convention; DR-014 defines the active repository location and historical handling.

### Alternatives Considered [REQUIRED]

**Alternative: Move all historical reviews to root `.review/`**
- Description: Relocate and rename every existing review bundle from `DOCS/.review/` to the v1.3 root path and naming format.
- Rejected because: review outputs are read-only once written. Moving and renaming historical review bundles would obscure their original provenance and require broad link updates.

**Alternative: Keep `DOCS/.review/` as the only review location**
- Description: Continue writing future reviews under `DOCS/.review/` while relying on DR-010 as a documented divergence.
- Rejected because: v1.3 makes the repository-root review directory a MUST, so this would leave a known compliance gap.

### Related Decisions

- DR-010 — Historical code review directory placement under `DOCS/.review/`.
- DR-012 — Active v1.3 review bundle naming convention.
- DR-029 — Active review output location under `DOCS/.review/`.

---

## DR-015 — Actor Memory via TakeNotes and thin step definitions (MIG-04 / MIG-05)

**Date:** 2026-05-16
**Status:** Accepted — 2026-05-16

### Context

`reference-architecture.md` v1.3 §3.5 requires that Memory keys be defined as named constants, and that Tasks write to Actor Memory while Questions read from it. Prior to MIG-04, the six constants in `tests/screenplay/support/memory-keys.ts` were defined but unused at runtime — all cross-step state flowed through private fields on `UseSudokuSolver` instead of through named Actor Memory keys. This left a parity risk: the documented Memory contract was not the runtime contract.

§2.1 additionally requires step definitions to be thin — delegating to `actor.attemptsTo(Task)` and `actor.answer(Question)`. Multiple step definition files imported `UseSudokuSolver` and `LoadPuzzles` and called their methods inline (MIG-05 finding).

### Decision

**MIG-04:** Add `TakeNotes.usingAnEmptyNotepad<SudokuNotes>()` to the Cast in `SudokuActors.ts`. Add a `SudokuNotes` typed interface to `memory-keys.ts`. Update all outcome Tasks to write to Actor Memory using `notes<SudokuNotes>().set(KEY, value).performAs(actor)` after their core action. Update the four outcome Questions (`SolveStatus`, `AlgorithmMadeProgress`, `PlacementValidity`, `ErrorThrown`) to read from Actor Memory using `actor.answer(notes<SudokuNotes>().get(KEY))`. All six keys now participate in runtime.

**MIG-05:** Create new Tasks (`SetTargetCell`, `SolvePuzzle.withCurrentGrid`, `SimulateError`, `CheckAlgorithmProgress`, `LoadPuzzleByIndex`, `LoadPuzzlesByDifficulty`, `LoadPuzzleByName.andInitialiseOrDefault`, `InitialiseGrid.fromPuzzleNamed`) and new Questions (`GridSnapshot`, `MultipleSolvers`, `LoadedPuzzles`, `CurrentSolver`, `TargetCell`), plus `GridCell.isDeepCopy()`. Update `SetupGridState.valuesInRow/Column/Block` to read `TARGET_CELL` from Actor Memory. Remove all direct Ability imports from step definition files.

The project-standard pattern for writing to Actor Memory inside `Interaction.where()` lambdas is `notes<SudokuNotes>().set(KEY, value).performAs(actor)` rather than `actor.attemptsTo(...)`, because the actor parameter inside `Interaction.where()` is typed as `UsesAbilities & AnswersQuestions & CollectsArtifacts` which does not expose `attemptsTo()`.

All 43 scenarios pass after the migration.

### Status

`Accepted` — 2026-05-16

### Consequences

**Outcomes:**
- The documented Memory contract is now the runtime contract. Future Stacks can implement the same six key constants and be in parity with the TypeScript Stack.
- Step definition files no longer import `UseSudokuSolver` or `LoadPuzzles`; Layer 2 is consistently thin.
- `notes<SudokuNotes>().set(KEY, value).performAs(actor)` is the canonical project pattern for writing to Actor Memory inside Task lambdas.

**Trade-offs:**
- Each outcome Task performs an additional `notes().set()` call per execution.
- Structural-state Questions (`GridCell`, `LoadedPuzzleCount`) continue to read from Ability fields; this is accepted because structural state is part of the Subject Application interface, not a published Memory key.

**Compliance note:**
- Implements `reference-architecture.md` v1.3 §3.3 (Tasks write Memory), §3.4 (Questions read Memory), §3.5 (Memory key constants), §2.1 (Layer 2 thin), §8.1 (Memory key parity).

### Alternatives Considered

**Alternative: Document Ability-field pattern as the authoritative Memory implementation**
- Description: Record that Ability fields are the project's implementation of Actor Memory without migrating to `notes()`.
- Rejected because: MIG-04 acceptance criteria requires Tasks to write and Questions to read named Memory keys; documentation only would leave the parity risk unresolved.

**Alternative: Use `actor.remember()` / `actor.recall()` directly**
- Description: Call `actor.remember(key, value)` and `actor.recall(key)` as described in RA §3.1.
- Rejected because: inside `Interaction.where()` the actor is typed as `UsesAbilities & AnswersQuestions & CollectsArtifacts`, which does not expose `remember()` or `recall()` in Serenity/JS v3.43.

### Related Decisions

- DR-008 — Serenity/JS Ability extension pattern.
- DR-012 — Active governance baseline (RA v1.3).

---

## DR-016 — Adopt kebab-case for Stack filesystem directories; distinguish from canonical Stack name

**Date:** 2026-05-16
**Status:** Accepted — 2026-05-16

### Context

The UPPER_SNAKE_CASE convention for the Stack group container (`DEMOAPPS/`) and Stack directory (`DEMOAPP001_TYPESCRIPT_CYPRESS/`) was adopted implicitly and was never recorded in the Decision Register. Analysis document `DOCS/.analysis/analysis-directory-naming-kebab-case-2026-05-16.md` surfaced two problems with the current convention:

1. **Case-sensitivity trap** — The repository is developed on a Windows (case-insensitive) filesystem and pushed to a Linux-hosted remote (case-sensitive). UPPER_CASE directory names create a latent risk where path mismatches silently succeed locally but fail on CI. This risk will become active when a CI pipeline is wired (BACKLOG-004).
2. **Ecosystem friction** — Node.js, TypeScript, npm tooling, and modern CI/CD YAML all default to lowercase-hyphenated paths. UPPER_CASE directories require Shift-key input and are the outlier against `.batch/`, `.results/`, `features-shared/`, and all Screenplay subdirectories which are already lowercase.

`reference-architecture.md` v1.3 §4.3 explicitly states that the Stack group directory does not define the canonical Stack name, opening the path to decouple the two conventions.

### Decision

**Filesystem directory names** for Stack group containers and Stack directories SHALL use `kebab-case`:

| Previous path | Adopted path |
|--------------|-------------|
| `DEMOAPPS/` | `demo-apps/` |
| `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/` | `demo-apps/demoapp001-typescript-cypress/` |

Future Stack group containers and Stack directories MUST use `kebab-case`.

**Canonical Stack name** — the identifier used in metrics output, Memory key prefixes, parity documentation, and the AI Agent Instruction File — remains `UPPER_SNAKE_CASE` and is INDEPENDENT of the filesystem directory name. For example:
- Directory: `demo-apps/demoapp001-typescript-cypress/`
- Canonical Stack name: `DEMOAPP001_TYPESCRIPT_CYPRESS`
- Stack short identifier (metrics): `DEMOAPP001`

The actual filesystem rename of existing directories is tracked as **MIG-13** in `DOCS/.planning/backlog.md` and is scheduled as a dedicated sprint immediately before Stack 2 onboarding.

### Status

`Accepted` — 2026-05-16

### Consequences

**Outcomes:**
- Removes the case-sensitivity trap for all future Stacks and for DEMOAPP001 once MIG-13 completes.
- Makes Stack directory naming consistent with the ecosystem norm and with all other lowercase directories in the repository.
- `naming-conventions.md` §3 and §4 updated to reflect the decoupling of directory name from canonical Stack name.
- Future Stack directories (`demo-apps/demoapp002-python-pytest/`, etc.) created with the correct convention from day one.

**Trade-offs:**
- MIG-13 requires updating approximately 220 references across ~80 files, including TypeScript path traversals, Cucumber config, orchestration scripts, and all documentation.
- Canonical Stack name retains UPPER_SNAKE_CASE, creating a visible divergence between directory name and Stack name that must be understood by all contributors and agents.

**Compliance note:**
- The directory name convention is a project-local decision not explicitly prescribed by `reference-architecture.md` v1.3. The RA §4.3 explicitly permits the group directory to use any name without affecting the canonical Stack name.

### Alternatives Considered

**Alternative: Retain UPPER_SNAKE_CASE for directories and record it formally**
- Description: Create a DR that formally adopts the implicit convention rather than changing it.
- Rejected because: the case-sensitivity trap is a real latent risk that UPPER_CASE directories preserve. The convention was also never intentionally chosen — it was incidental. A formal decision to keep a problematic implicit convention is worse than adopting the ecosystem standard.

**Alternative: Lowercase without hyphens (e.g., `demoapps/`, `demoapp001typescriptcypress/`)**
- Description: Use plain lowercase without a separator character.
- Rejected because: kebab-case is the ecosystem standard and is already used in project files (`tooling/`, `node_modules/`, npm script names). Removing word boundaries in `demoapp001typescriptcypress` makes the name unreadable.

### Related Decisions

- DR-001 — Dot-prefix convention for DOCS subdirectories (established lowercase for DOCS internals).
- DR-012 — RA v1.3 adoption baseline.
- DR-015 — Actor Memory via TakeNotes (references DEMOAPP001_TYPESCRIPT_CYPRESS as canonical Stack name in metrics).

### Evidence

- `DOCS/.analysis/analysis-directory-naming-kebab-case-2026-05-16.md` — full impact analysis with blast radius assessment and implementation plan.

---

## DR-017 — Make DOCS/.implementation-logs/ the authoritative implementation-log directory (MIG-09)
**Superseded by:** DR-019 (2026-05-16) — authoritative path is now `DOCS/.implementation-logs/`

**Date:** 2026-05-16
**Status:** Accepted — 2026-05-16

### Context

DR-013 created `DOCS/.implementation-logs/README.md` as a v1.3 compatibility bridge, leaving `DOCS/.implementation/` as the authoritative content location and explicitly deferring the path decision to MIG-09. `reference-architecture.md` v1.3 §10.8 names `implementation-logs/` as the required directory and requires log files to use UTC date-prefix plus short-slug naming (`YYYY-MM-DD_short-session-topic.md`). The two existing logs in `DOCS/.implementation/` use the legacy `IMPL_LOG_YYYY-MM-DD_Long_Title.md` pattern and are not in the v1.3-required location.

### Decision

Make `DOCS/.implementation-logs/` the authoritative implementation-log directory. Move existing logs from `DOCS/.implementation/` to `DOCS/.implementation-logs/` and rename them to the v1.3 pattern:

| Old path | New path |
|----------|----------|
| `DOCS/.implementation/IMPL_LOG_2026-01-30_Initial_Project_Creation.md` | `DOCS/.implementation-logs/2026-01-30_initial-project-creation.md` |
| `DOCS/.implementation/IMPL_LOG_2026-05-14_Sprint2_Naming_Conventions_And_Testing.md` | `DOCS/.implementation-logs/2026-05-14_naming-conventions-and-testing.md` |

`DOCS/.implementation/` becomes a read-only archive. Its README is updated to reflect this. `DOCS/.implementation-logs/README.md` is updated to be the authoritative directory index. Future implementation logs MUST be written to `DOCS/.implementation-logs/` and MUST use `YYYY-MM-DD_short-session-topic.md` naming. The `TEMPLATE_Implementation_Log.md` file in `DOCS/.implementation/` is retained in the archive; the canonical template remains `DOCS/.templates/implementation-log.template.md`.

### Status

`Accepted` — 2026-05-16

### Consequences

**Outcomes:**
- `DOCS/.implementation-logs/` is now the single authoritative location for implementation logs.
- v1.3 §10.8 path and naming requirements are fully satisfied.
- The DR-013 compatibility bridge for implementation logs is superseded by this decision.

**Trade-offs:**
- `DOCS/.implementation/` remains in the repository as an archive, which means two directories exist during the transition. The archive README clearly marks it as read-only.
- Any existing external references to the old paths are stale but still resolve to the archive.

**Compliance note:**
- Implements `reference-architecture.md` v1.3 §10.8 path and naming requirements.
- Supersedes the implementation-log deferral recorded in DR-013.

### Alternatives Considered

**Alternative: Keep DOCS/.implementation/ as authoritative and update the naming convention only**
- Description: Rename files in place within `DOCS/.implementation/` and document that directory as the project's implementation of §10.8.
- Rejected because: DR-013 explicitly created the compatibility bridge path to be resolved by MIG-09. Using the non-literal path would leave a permanent divergence when the literal path (`DOCS/.implementation-logs/`) now has a proper README and is ready to become authoritative.

**Alternative: Delete DOCS/.implementation/ entirely**
- Description: Move all content and remove the old directory.
- Rejected because: The TEMPLATE_Implementation_Log.md in `.implementation/` and the README history are useful references. Keeping it as a labelled archive is lower risk than deletion.

### Related Decisions

- DR-001 — Dot-prefix convention for DOCS subdirectories (established the original `.implementation/` location).
- DR-013 — Added the compatibility bridge; this decision supersedes its implementation-log deferral.

---

## DR-018 — Parameterize over-specified Gherkin step text (MIG-11)

**Date:** 2026-05-16
**Status:** Accepted — 2026-05-16

### Context

`reference-architecture.md` v1.3 §5.4 states that steps that embed specific values inline SHOULD be refactored to accept those values as parameters, and §8.2 states that any change to step Gherkin text MUST be applied to all Stacks simultaneously and recorded in the Decision Register. Two canonical scenarios embedded inline array literals that block portability across future Stacks:

1. `Given a row contains the values [1, 2, 0, 4, 5, 6, 7, 8, 9]` — the row array is a literal in the step text.
2. `Given an empty cell has 3 possible candidates: [2, 5, 8]` — both the count and the candidate list are literals in the step text.

### Decision

Convert both scenarios to Scenario Outlines with array data in Examples tables. Change the step text as follows:

| Old step text | New step text |
|---------------|---------------|
| `Given a row contains the values [1, 2, 0, 4, 5, 6, 7, 8, 9]` | `Given a row contains the values "<rowValues>"` (Examples: `rowValues = 1, 2, 0, 4, 5, 6, 7, 8, 9`) |
| `Given an empty cell has 3 possible candidates: [2, 5, 8]` | `Given an empty cell has <count> possible candidates: "<candidates>"` (Examples: `count = 3`, `candidates = 2, 5, 8`) |

Step definitions are updated to use `{string}` (and `{int}`) Cucumber expressions rather than hardcoded literal text. The parsed values drive the same underlying Task calls. The canonical feature file and the Stack-local copy are updated simultaneously. Scenario count remains 43.

### Status

`Accepted` — 2026-05-16

### Consequences

**Outcomes:**
- Both step texts are now reusable across future Stacks without duplication of the literal data.
- Step definitions use standard Cucumber expression parameters, making them easier to extend with additional Examples rows.
- v1.3 §5.4 SHOULD requirement is satisfied for the identified over-specified steps.

**Trade-offs:**
- Scenario Outline syntax is slightly more verbose than plain Scenario syntax for single-row cases.
- Step definition parsing adds a small amount of string-split logic, which is a mild increase in complexity.

**Compliance note:**
- Implements `reference-architecture.md` v1.3 §5.4 (parameterised steps) and §8.2 (step text parity across Stacks).
- Applied simultaneously to canonical (`features-shared/`) and Stack-local (`demo-apps/demoapp001-typescript-cypress/tests/features/`) feature files.

### Alternatives Considered

**Alternative: Leave both steps as-is and document the inline literals as acceptable**
- Description: Record a dispensation in the Decision Register rather than refactoring the step text.
- Rejected because: §5.4 requires refactoring before Stack 2 onboarding to ensure portable step definitions. Leaving literals in place defers the problem to Stack 2 implementors.

**Alternative: Parameterize all inline numeric literals in step text (e.g., "3 empty cells", "3 different puzzles")**
- Description: Extend the refactoring to every step that contains an inline number.
- Rejected because: Steps like `Given {int} empty cells each have exactly one possible value` already use the `{int}` Cucumber expression — the number in the Gherkin is a matched parameter, not a fixed literal in the step definition. Only steps where the literal is in the step *definition string itself* are over-specified.

### Related Decisions

- DR-012 — Active v1.3 governance baseline.
- DR-015 — Step definition shape (thin step definitions).

---

## DR-019 — Extend dot-prefix convention to all DOCS subdirectories; eliminate bridge directories (MIG-DOCS-01)

**Date:** 2026-05-16
**Status:** Accepted — 2026-05-16
**Supersedes:** DR-013 (bridge strategy for RA-literal DOCS paths), DR-017 (implementation-logs/ as authoritative path)

### Context

DR-001 (2026-01-30) established dot-prefix as the project convention for all DOCS type-specific subdirectories. However, subsequent decisions created non-dot plain-name directories under `DOCS/` without applying DR-001:

- DR-013 (2026-05-15) created `DOCS/design/`, `DOCS/planning/`, and `DOCS/implementation-logs/` as RA v1.3 compatibility bridges, resulting in dual directories for three roles: `.design/` + `design/`, `.planning/` + `planning/`, `.implementation/` + `implementation-logs/`.
- DR-017 (2026-05-16) made `DOCS/implementation-logs/` the authoritative implementation-log directory, but left `DOCS/.implementation/` in place as an archive — creating a split between two directories for the same role.
- `DOCS/architecture/` and `DOCS/templates/` were created without applying DR-001, resulting in two more plain-name directories and a shadow `.templates/` with only one file while 22 files remained in `DOCS/templates/`.

The result is 13 DOCS subdirectories using three different naming conventions, with dual-directory confusion for four roles. The DR-001 single-convention rule is violated.

### Decision

Extend DR-001's dot-prefix convention to cover ALL DOCS type-specific subdirectories without exception. No plain-name (non-dot) subdirectories exist under `DOCS/` in the final state.

**Directory renames:**

| From | To | Action |
|------|----|--------|
| `DOCS/.architecture/` | `DOCS/.architecture/` | `git mv` |
| `DOCS/.templates/` | `DOCS/.templates/` | Merge all 22 files via `git mv` into existing `.templates/` |
| `DOCS/.implementation/` + `DOCS/.implementation-logs/` | `DOCS/.implementation-logs/` | Rename `.implementation/` → `.implementation-logs/`; move 3 files from `implementation-logs/`; create unified README |
| `DOCS/design/` | REMOVED | Bridge no longer needed; `.design/` is the sole authority |
| `DOCS/planning/` | REMOVED | Bridge no longer needed; `.planning/` is the sole authority |

The `DOCS/.templates/decision-record.template.md` stale single-file is removed; the full governed template from `DOCS/.templates/decision-record.template.md` replaces it. All other `.templates/` pre-existing content is superseded by the `templates/` versions.

**RA path divergence:** `reference-architecture.md` v1.3 names `DOCS/.architecture/`, `DOCS/.templates/`, `DOCS/planning/`, `DOCS/design/`, and `DOCS/.implementation-logs/` as literal paths. All five diverge from this convention under the same MAY-level latitude clause that authorised DR-001. This is a documented project-local decision. The RA text is not changed.

### Status

`Accepted` — 2026-05-16

### Consequences

**Outcomes:**
- A single uniform convention covers all DOCS subdirectories: dot + kebab-case.
- The four dual-directory role conflicts are resolved.
- Bridge files (`DOCS/design/`, `DOCS/planning/`) are removed — contributors read one location, not two.
- `DOCS/.implementation-logs/` and `DOCS/.implementation/` are consolidated into `DOCS/.implementation-logs/`.
- `DOCS/.templates/` and the stub `DOCS/.templates/` are consolidated into `DOCS/.templates/`.

**Trade-offs:**
- All references to `DOCS/.templates/`, `DOCS/.architecture/`, `DOCS/.implementation-logs/`, `DOCS/design/`, and `DOCS/planning/` in ~16 files must be updated.
- The v1.3 RA-literal paths no longer exist on disk; a new agent reading the RA and not this DR would look in the wrong place. The DR-001 divergence pattern is precedent for this.

**Compliance note:**
- Documented divergence from `reference-architecture.md` v1.3 §4, §10.3, §10.5, §10.8, §10.9 path literals, at the MAY-level latitude clause for directory naming.
- DR-001 established the precedent; this decision extends it consistently to the remaining directories.

### Alternatives Considered

**Alternative: Keep RA-literal directories as authoritative; remove dot-prefix dirs**
- Description: Adopt the RA's plain-name directories as the project standard instead of DR-001 dot-prefix.
- Rejected because: DR-001 is a well-established, actively maintained decision and a deliberate project-local divergence. Reversing it would require updating every existing reference to dot-prefix directories (a larger change) and would lose the visual-grouping benefit that motivated DR-001.

**Alternative: Retain bridges; document that both paths are valid**
- Description: Keep both dot-prefix and plain-name directories indefinitely, treating both as valid aliases.
- Rejected because: Dual directories for the same role is the root cause of the confusion this decision addresses. Formalising the duality resolves nothing.

### Related Decisions

- DR-001 — Established dot-prefix convention; this decision extends it to all DOCS subdirectories.
- DR-013 — Bridge strategy superseded; bridges are removed.
- DR-017 — `DOCS/.implementation-logs/` authoritative designation superseded; new authoritative path is `DOCS/.implementation-logs/`.

### Evidence

- `DOCS/.analysis/analysis-docs-subdirectory-cleanup-20260516.md` — full discrepancy map, file inventory, and migration plan.

---

## DR-020 — Adopt kebab-case for all authored document filenames; define permanent exceptions

**Date:** 2026-05-17
**Status:** Accepted — 2026-05-17

### Context

The project's document filenames currently use four simultaneous naming conventions: `PREFIX_Title_Case.md` (for authored design, algorithm, planning, and how-to documents), `UPPERCASE.md` (for root governance files), `YYYY-MM-DD_slug.md` (for implementation logs, established by DR-017), and `kebab-case.md` (for architecture documents and all `.template.md` files). This multi-convention state is inconsistent with the single-convention direction established for directories (DR-016, DR-019) and generates ongoing contributor confusion. `DOCS/.analysis/analysis-document-naming-kebab-case-20260516.md` documents the full discrepancy landscape and blast-radius assessment.

### Decision

Adopt `lowercase-kebab-case.md` as the project standard for all authored document filenames. Three permanent exceptions are defined where external tooling or ecosystem conventions lock the filename:

| File | Exception reason |
|------|-----------------|
| `README.md` (all locations) | GitHub/npm ecosystem hard standard — rendered automatically by name |
| `CHANGELOG.md` | CI tooling dependency (standard-version, semantic-release, keep-a-changelog CLI generate this exact filename) |
| `CLAUDE.md` | Anthropic Claude Code tooling default — looked up by exact filename; renaming risks breaking agent instruction discovery on case-sensitive Linux CI |

All generated artefacts in `.results/` (metrics files, parity reports) are also exempt — their naming is governed by RA §9.2 and the orchestration scripts, not by this convention.

The migration is executed in four phases per `DOCS/.analysis/analysis-document-naming-kebab-case-20260516.md §6`:
- **Phase 1** — Authored documents in typed directories (`.design/`, `.algorithm/`, `.howto/`, `.planning/`, `.implementation-logs/`)
- **Phase 2** — DOCS root files and Stack-level docs
- **Phase 3** — Root governance files (`decision-register.md`, legacy backlog redirect)
- **Phase 4** — Update `naming-conventions.md` and `CLAUDE.md` to reflect the new single rule

`naming-conventions.md` is updated in Phase 4 to replace the five per-type prefix rules (`DESIGN_`, `ALGORITHM_`, `HOWTO_`, `TODO_`, `TEMPLATE_`) with a single rule: authored documents use `word-word.md` in kebab-case. The three permanent exceptions are documented in naming-conventions.md.

### Status

`Accepted` — 2026-05-17

### Consequences

**Outcomes:**
- A single document naming convention (`kebab-case.md`) extends the direction already established for directories (DR-016, DR-019), implementation logs (DR-017), architecture docs, and `.template.md` files.
- The five per-type prefix rules in `naming-conventions.md` (Sections 5) are replaced by one rule, simplifying the conventions document.
- Prefix redundancy is eliminated — `audit-trail-feature.md` becomes `audit-trail-feature.md`; the `.design/` directory already signals the document type.

**Trade-offs:**
- ~29 files renamed across Phases 1–3; ~155 reference updates required.
- `git log --follow` and `git blame` break for renamed files. The migration commit message serves as the navigation point.
- Three permanent exceptions mean the "kebab-case for documents" rule always has a known exception list. Contributors must learn the exceptions.
- Historical review outputs under `DOCS/.review/` reference the pre-migration filenames and cannot be edited (read-only per RA §10.7). Those references permanently point to the pre-migration names.

**Compliance note:**
- Documented project-local convention. `reference-architecture.md` v1.3 §10 does not prescribe document filename casing; this is a project-level decision.

### Alternatives Considered

**Alternative: Retain the current prefix-based system and formally document it**
- Description: Record `PREFIX_Title_Case.md` as the official convention in the Decision Register.
- Rejected because: The prefix system is already partially broken — `.template.md` files, architecture docs, and implementation logs do not use it. Formalising it would cement an inconsistency rather than resolve it.

**Alternative: Kebab-case with no exceptions (rename README.md, CHANGELOG.md, CLAUDE.md)**
- Description: Rename every file including the ecosystem-locked ones.
- Rejected because: `README.md` is rendered by GitHub and npm by exact filename. `CHANGELOG.md` is generated by common CI tools. `CLAUDE.md` is looked up by exact name by the Anthropic tooling. Renaming any of these introduces ecosystem breakage or tooling conflicts that outweigh the convention-uniformity benefit.

### Related Decisions

- DR-016 — Adopted kebab-case for Stack filesystem directories; same motivation applies to document filenames.
- DR-019 — Extended dot-prefix convention to all DOCS subdirectories.
- DR-017 — Established `YYYY-MM-DD_short-slug.md` for implementation logs (already kebab-case and already compliant).

### Evidence

- `DOCS/.analysis/analysis-document-naming-kebab-case-20260516.md` — full impact assessment, pros/cons, decision points, and four-phase implementation plan.

---

## DR-021 — Formalise `@util` as a first-class surface type in reference-architecture.md v1.4 (RA-001)

**Date:** 2026-05-18
**Status:** Accepted — 2026-05-18

### Context

`reference-architecture.md` v1.3 defined three Surface Types: API, UI, and CLI. The `@util` tag was introduced in Section 5.3 and referenced in Appendix B's compliance checklist, but no corresponding surface contract existed in Section 6, no Ability definition in Section 7, and no orchestration lifecycle in Section 9.1. This left the most commonly used surface type for single-application projects (in-process class testing) as a specification orphan. Any project using `@util` — including this one — had no normative definition to conform to. The gap was identified and documented as Risk 1 (Critical) in the structural review `DOCS/.review/2026-05-18_reference-architecture-structural-review.md`.

### Decision

Promote `@util` to a formally specified Surface Type in `reference-architecture.md` v1.4:

- **Section 6.0** added: `@util` surface contract. Defines in-process subject application requirements (importable directly, no shared mutable state between scenarios, deterministic, fresh-instance per scenario).
- **Section 7.0** added: canonical `@util` Ability taxonomy. Canonical name `UseSubjectDirectly` (illustrative; project-specific names permitted). Structural contract: holds instance reference, delegates invocation to Tasks, stores results in Memory.
- **Section 9.1** updated: `@util` orchestration lifecycle added (build, verify importable, execute, capture, write metrics).
- **Section 8.1** updated: minimum Memory key set for `@util` surface documented (`SOLVE_RESULT`, `ALGORITHM_PROGRESS`).
- **Appendix B** updated: `@util` surface compliance checklist block added.
- RA version bumped from v1.3 to v1.4, date updated to 2026-05-18.

### Status

`Accepted` — 2026-05-18

### Consequences

**Outcomes:**
- `@util` is now a fully specified surface type with a surface contract, Ability taxonomy, orchestration lifecycle, minimum Memory key set, and compliance checklist block.
- Projects using `@util` can assess their conformance against a normative definition rather than inferring it from usage examples.
- Future Stacks using `@util` (DEMOAPP002, DEMOAPP003) have a canonical Ability pattern to follow.

**Trade-offs:**
- The minimum Memory keys (`SOLVE_RESULT`, `ALGORITHM_PROGRESS`) are named based on this project's current implementation. Projects with different subject applications may find the names semantically misleading; the RA clarifies these are minimum examples, not required literal names.
- The canonical Ability name `UseSubjectDirectly` is illustrative only — the structural contract is normative, the name is not. This distinction requires clear communication to avoid implementors treating the canonical name as mandatory.

**Compliance note:**
- Aligns the RA with its own tag taxonomy. All existing `@util` usage in this project (Sections 5.3, Appendix B) now has a normative definition.

### Alternatives Considered

**Alternative: Leave `@util` as an informal convention**
- Description: Document that `@util` is a project-local extension of the architecture without formalising it.
- Rejected because: The tag already appears in two locations of the RA (Sections 5.3 and Appendix B) without definition. Leaving it informal increases, not decreases, the specification gap and misleads future implementors.

**Alternative: Define `@util` as a subset of the CLI surface**
- Description: Treat in-process testing as a restricted form of CLI testing where the "command" is a function call.
- Rejected because: The CLI surface requires process invocation, exit code handling, and stdout/stderr capture. In-process testing shares none of these concerns. The surfaces are structurally distinct.

### Related Decisions

- DR-002 — TypeScript + Cucumber.js for DEMOAPP001; DEMOAPP001 uses `@util` surface.
- DR-003 — In-process (`@util`) surface choice for DEMOAPP001 testing.
- DR-015 — Actor Memory wiring; the `@util` Memory key minimum set formalises the pattern already used in this project.

---

## DR-022 — Add CI/CD pipeline requirements section to reference-architecture.md v1.5 (RA-002)

**Date:** 2026-05-18
**Status:** Accepted — 2026-05-18

### Context

`reference-architecture.md` v1.4 mandated orchestration scripts (Section 9.1), metrics collection (Section 9.2), and results archival (Section 9.3) but specified nothing about how these integrate into a CI/CD pipeline. The RA had no definition of required pipeline gates, exit code handling, artifact retention in CI context, or multi-Stack pipeline behaviour. A project following the RA could satisfy all Section 9 requirements locally while having a CI pipeline that ignores the feature parity report or permits merges on non-zero exit. The gap was identified and documented as Risk 2 (High) in the structural review `DOCS/.review/2026-05-18_reference-architecture-structural-review.md`.

### Decision

Add Section 9.4 "CI/CD Pipeline Requirements" to `reference-architecture.md` v1.5:

- **Required gates (in order):** Build → Lint/Format → Test suite → Feature parity report. Each gate must exit 0 or the pipeline halts.
- **`OverallExitCode` contract:** Orchestration scripts must surface `OverallExitCode`; non-zero must cause pipeline step failure; CI must treat non-zero as a blocking failure.
- **Feature parity gate:** Parity report is a required CI gate (not optional). Pipeline MUST fail on `DRIFT` or `MISSING`.
- **Artifact retention in CI:** Test logs and metrics must be retained for the same minimum period as Section 9.3 (seven calendar days). CI artifact storage satisfies the requirement. Metrics files must be published as pipeline artifacts.
- **Multi-Stack pipelines:** Each Stack has an independent job; one failure must not suppress another Stack's failure report; all jobs must complete before merge.
- RA version bumped from v1.4 to v1.5, date remains 2026-05-18.

### Status

`Accepted` — 2026-05-18

### Consequences

**Outcomes:**
- CI/CD pipelines built against this RA now have a normative gate sequence and exit-code contract to conform to.
- The feature parity report moves from "run when convenient" to a mandatory merge gate.
- Multi-Stack projects have a defined isolation policy preventing one Stack's failure from obscuring another's.

**Trade-offs:**
- The section does not prescribe a specific CI platform (GitHub Actions, GitLab CI, etc.) to remain agnostic. Project-level DOCS must supply platform-specific implementation details.
- Requiring all Stack jobs to complete before merge may increase pipeline duration for large multi-Stack projects. This is an acceptable trade-off to ensure full visibility.

**Compliance note:**
- DEMOAPP001 currently has no GitHub Actions workflow (BACKLOG-004). This decision records the normative requirement; BACKLOG-004 remains the implementation backlog item.

### Alternatives Considered

**Alternative: Leave CI/CD to project-level documentation only**
- Description: Keep the RA silent on CI/CD and let each project define its own pipeline policy.
- Rejected because: The RA mandates orchestration scripts and metrics specifically so they can be used as pipeline gates. Leaving the pipeline contract undefined allows projects to comply with the letter of the RA while ignoring its intent.

**Alternative: Prescribe a specific CI platform**
- Description: Write Section 9.4 as a GitHub Actions specification.
- Rejected because: The RA is platform-agnostic by design. Platform-specific configuration belongs in Stack-level or project-level documentation.

### Related Decisions

- DR-017 — Implementation log path; logs produced by CI runs are subject to Section 9.3/9.4 retention.
- DR-021 — `@util` surface type; Section 9.4 gates apply to all surface types including `@util`.

---

## DR-023 — Mandate automated Memory key parity enforcement in multi-Stack projects (RA-003)

**Date:** 2026-05-18
**Status:** Accepted — 2026-05-18

### Context

Section 8.1 of `reference-architecture.md` v1.5 mandated identical Memory key constants across all Stacks and specified that the constant name must equal its string value exactly. The enforcement mechanism was manual: a developer reading the Appendix B checklist at PR review. For a single-Stack project this is adequate; for a multi-Stack project (two or more active Stacks) it is insufficient — nothing prevents a developer from introducing a parity gap that is invisible until cross-Stack debugging is required. The gap was identified and documented as Risk 3 (High) in the structural review `DOCS/.review/2026-05-18_reference-architecture-structural-review.md`.

### Decision

Extend `reference-architecture.md` v1.5 to v1.6 by adding an "Automated enforcement" subsection to Section 8.1:

- **Single-Stack projects** MAY continue to use manual checklist (Appendix B) verification.
- **Multi-Stack projects (2+ active Stacks)** MUST provide an automated Memory key parity checker that:
  - Parses each Stack's `screenplay/support/memory-keys` file
  - Verifies constant name equals string value (NAME_VALUE_MISMATCH check)
  - Verifies the set of constant names is identical across all Stacks (SET_MISMATCH check)
  - Exits non-zero on any failure
- The checker MUST be a required CI gate per Section 9.4.
- Appendix A updated: `memory-key-check.template.md` added to the template index.

**Project-level implementation (DEMOAPP001 baseline):**
- Template created: `DOCS/.templates/memory-key-check.template.md`
- Script created: `.batch/check-memory-key-parity.ps1`
- Script parses TypeScript `export const KEY = 'KEY'` pattern; includes commented stubs for DEMOAPP002 and beyond.
- Currently single-Stack: exits 0, verifies all 6 DEMOAPP001 constants satisfy name=value.

### Status

`Accepted` — 2026-05-18

### Consequences

**Outcomes:**
- Memory key parity has an automated enforcement path that scales to any number of Stacks.
- `.batch/check-memory-key-parity.ps1` can be added to CI immediately (BACKLOG-004 tracks the GitHub Actions workflow).
- When DEMOAPP002 is onboarded, the script stub is already present — the developer uncomments the entry and extends the Pattern if needed.

**Trade-offs:**
- The script currently supports only TypeScript pattern extraction. Each new Stack language requires a pattern extension. The template documents the patterns for TypeScript, Python, C#, and Java.
- The CI gate for memory key checking depends on BACKLOG-004 (GitHub Actions). Until that is implemented, the script can be run locally as a pre-commit or pre-PR step.

**Compliance note:**
- DEMOAPP001 currently passes the check with all 6 constants verified. No parity gaps exist at this time.

### Alternatives Considered

**Alternative: Keep manual checklist only**
- Description: Rely on Appendix B checklist review at every PR.
- Rejected because: In multi-Stack projects the checklist must be run for every Stack simultaneously. Human error is the only failure mode and it is silent — a gap would not surface until cross-Stack debugging reveals inconsistent key names. The automated approach is deterministic and CI-enforceable.

**Alternative: Embed the check inside the orchestration script**
- Description: Add memory key validation to `run-demoapp001.ps1` rather than a standalone script.
- Rejected because: The orchestration script is Stack-specific; the parity check is cross-Stack. Separating them keeps responsibilities clear and allows the parity check to run independently of any one Stack's test suite.

### Related Decisions

- DR-015 — Actor Memory wiring; the constants being checked are those introduced in DR-015.
- DR-021 — `@util` surface type; the minimum Memory key set is defined there.
- DR-022 — CI/CD pipeline requirements; the parity checker is one of the gates specified in Section 9.4.

---

## DR-024 — Add Canonical Feature Store change governance as Section 5.5 to RA v1.7 (RA-004)

**Date:** 2026-05-18
**Status:** Accepted — 2026-05-18

### Context

`reference-architecture.md` Sections 5.1–5.4 defined the Canonical Feature Store concept and the propagation process for distributing feature changes to Stacks. However, Section 5 had no change governance: no classification of breaking versus non-breaking changes, no review gate requirement for breaking changes, no coordination specification for Stacks that cannot implement a change immediately, and no deadline policy for `@pending` scenarios. Without governance, a developer could modify canonical step text and only discover broken Stacks at CI time rather than at change-proposal time. The gap was identified and documented as Risk 4 (High) in the structural review `DOCS/.review/2026-05-18_reference-architecture-structural-review.md`.

### Decision

Add Section 5.5 "Feature Change Governance" to `reference-architecture.md` v1.7:

- **Change classification table:** Defines which change types are Breaking (add/remove/modify scenario or step text) and which are Non-breaking (tag changes, whitespace, descriptions).
- **Breaking change gate (MUST):** Before merging any breaking change: all affected Stack step definitions must be updated or marked `@pending`; a DR entry created if structural; a backlog item created for every Stack that cannot implement immediately; parity report must pass.
- **`@pending` resolution deadline:** A `@pending` scenario must be resolved within the next sprint. Persistence beyond two consecutive sprint boundaries without a DR entry is classified as a governance defect, not an accepted state.
- **Canonical file protection rules:** Canonical files MUST NOT be modified to add Stack-specific details, remove a scenario because one Stack cannot implement it, or be changed by a developer working on a Stack-local implementation.
- RA version bumped from v1.6 to v1.7, date remains 2026-05-18.

### Status

`Accepted` — 2026-05-18

### Consequences

**Outcomes:**
- Breaking changes to the canonical feature store now have a defined gate sequence that prevents silent parity gaps.
- The `@pending` deadline policy converts open-ended parity gaps into time-bound commitments with escalation criteria.
- The canonical file protection rules prevent the most common anti-pattern: a Stack developer modifying the canonical source to reflect their Stack's limitations.

**Trade-offs:**
- The breaking change gate adds overhead to scenario authoring. This is intentional — canonical changes have cross-Stack impact and warrant coordination.
- The one-sprint resolution deadline for `@pending` scenarios may be aggressive for projects with long sprint cycles. Projects with sprints longer than two weeks SHOULD document an alternative deadline in their `naming-conventions.md` or a dedicated governance document.

**Compliance note:**
- DEMOAPP001 currently has no `@pending` scenarios. The governance applies immediately when new Stacks are onboarded or new scenarios are added to the canonical feature store.

### Alternatives Considered

**Alternative: Leave feature governance to the backlog process only**
- Description: Rely on backlog items to track parity gaps without a formal gate sequence.
- Rejected because: The backlog process is reactive — it records gaps after they exist. The breaking change gate is proactive — it prevents gaps from being introduced without a mitigation plan. Both mechanisms are needed.

**Alternative: Require all Stacks to implement canonical changes simultaneously**
- Description: No `@pending` permitted; all Stacks must update atomically.
- Rejected because: For a project with multiple language Stacks at different maturity levels, simultaneous implementation is often impractical. The `@pending` mechanism with a deadline policy provides a structured grace period without allowing indefinite drift.

### Related Decisions

- DR-018 — Gherkin parameterization; parameterised steps reduce the frequency of breaking changes when scenario behaviour evolves.
- DR-021 — `@util` surface type; the feature store contains `@util` scenarios that this governance applies to.

---

## DR-025 — Resolve uppercase document name conflict in RA Sections 10.1 and 10.2 (RA-006)

**Date:** 2026-05-18
**Status:** Accepted — 2026-05-18

### Context

`reference-architecture.md` v1.8 contained a direct normative conflict: Section 10.2 specified `ARCHITECTURE.md`, `SCREENPLAY_GUIDE.md`, and `QA_STRATEGY.md` as required fixed uppercase names for Stack-level documents, while Section 10.9 required a `naming-conventions.md` document to govern all naming decisions — including file names. Following both simultaneously was impossible; adopting kebab-case (the RA's own recommended default in Section 10.9) for Stack-level docs meant violating Section 10.2. This project resolved the conflict by adopting kebab-case per DR-020, meaning this project was already in violation of the RA it was supposed to conform to. The gap was identified and documented as Risk 7 (Medium) in the structural review `DOCS/.review/2026-05-18_reference-architecture-structural-review.md`.

### Decision

Update `reference-architecture.md` v1.9 to resolve the conflict:

**Section 10.1 changes:**
- Add "Name type" distinction: `README.md` and `CHANGELOG.md` are **FIXED** (locked by ecosystem convention — recognized by GitHub, npm, and hosting platforms by name). The backlog document and decision register are **convention-governed** (project's `naming-conventions.md` determines the exact filename).
- Add explanatory note distinguishing FIXED vs convention-governed names.

**Section 10.2 changes:**
- Remove fixed uppercase names (`ARCHITECTURE.md`, `SCREENPLAY_GUIDE.md`, `QA_STRATEGY.md`).
- Replace with **convention-governed** document roles. Each role has an illustrative kebab-case name (the RA's recommended default). Projects adopting a different convention document the exact filenames in `naming-conventions.md`.
- `README.md` retains FIXED status.
- Migration note added: projects already using kebab-case equivalents are in compliance.

**Appendix A changes:**
- "Name type" column added to the template index, distinguishing FIXED from convention-governed for each template.

- RA version bumped from v1.8 to v1.9, date remains 2026-05-18.

### Status

`Accepted` — 2026-05-18

### Consequences

**Outcomes:**
- The normative conflict is resolved. A project can now follow both Section 10.2 and Section 10.9 simultaneously.
- This project's Stack-level documents (`architecture.md`, `screenplay-guide.md`, `qa-strategy.md`, per DR-020) are now explicitly in compliance with the RA.
- Future Stacks are free to use any consistent naming convention without being in violation of the RA's own rules.
- The FIXED / convention-governed distinction provides a clear mental model for future document naming decisions.

**Trade-offs:**
- By making Stack-level document names convention-governed rather than fixed, the RA loses some of the discoverability benefit of uniform names across all projects adopting the architecture. This is an acceptable trade-off — a project's `naming-conventions.md` and `CLAUDE.md` provide the same discoverability within that project's context.
- The migration note in Section 10.2 is a one-way forward reference; it will become stale if the RA is adopted by many projects. Projects that need historical context should consult the decision register.

**Compliance note:**
- This project is in compliance with RA v1.9 as of this entry. DEMOAPP001 Stack-level docs use kebab-case per DR-020, which aligns with the illustrative default shown in the updated Section 10.2.

### Alternatives Considered

**Alternative: Make all Stack-level document names FIXED (enforce uppercase)**
- Description: Restore `ARCHITECTURE.md`, `SCREENPLAY_GUIDE.md`, `QA_STRATEGY.md` as mandatory names, effectively superseding DR-020 for these files.
- Rejected because: This project has already migrated to kebab-case per DR-020 and the files are working correctly. Reverting would undo committed, validated work with no benefit. The conflict is better resolved by making the RA flexible.

**Alternative: Keep the conflict and document it as a known exception**
- Description: Note in Section 10.2 that the names are illustrative and projects may use kebab-case equivalents.
- Rejected because: A normative MUST that can silently be overridden is not a normative MUST. The proper fix is to change the normative requirement, not add a footnote.

### Related Decisions

- DR-020 — Document kebab-case naming convention for this project. DR-025 makes the RA formally consistent with DR-020.
- DR-019 — DOCS subdirectory naming; same project-level convention applies to subdirectory names.

---

## DR-026 — Add test data management specification as Section 5.6 to RA v1.10 (RA-007)

**Date:** 2026-05-18
**Status:** Accepted — 2026-05-18

### Context

`reference-architecture.md` v1.9 specified behavioral contracts (Gherkin feature files), orchestration contracts (lifecycle, metrics), and parity rules, but contained no guidance on test data — the fixtures, seeds, and configuration files that drive scenario execution. For projects where test data is the primary input to the system under test (e.g. this project's `puzzles.json`), the absence creates three concrete risks: test data scattered across inconsistent locations, scenarios modifying shared data and causing order-dependent failures, and inline data literals embedded in canonical feature files defeating parameterisation. The gap was identified and documented as Risk 8 (Medium) in the structural review `DOCS/.review/2026-05-18_reference-architecture-structural-review.md`.

### Decision

Add Section 5.6 "Test Data Management" to `reference-architecture.md` v1.10:

- **Location rules table:** Stack-local data stays in the Stack directory; shared data (two or more Stacks) MUST live in `packages/` or a dedicated `data/` directory at the repository root; shared data path MUST be documented in `DOCS/architecture/subject-app-contract.md`.
- **Inline literal prohibition (MUST NOT):** Test data MUST NOT be embedded as inline literals in canonical feature files. Use parameterised steps (Section 5.4) and provide values in Stack-local `Examples` tables.
- **Scenario isolation (MUST NOT):** A scenario MUST NOT modify shared test data. It MUST operate on a copy or in-memory representation. Read-only shared files MUST be treated as read-only during execution; mutable state requires a deep copy per scenario.
- **Versioning:** Stack-local data versioned with the Stack. Shared data versioned independently; changes affecting scenario outcomes treated as breaking changes (Section 5.5) and require a DR entry.
- **Data-driven pattern:** Scenario Outlines with Examples SHOULD be used for data-driven scenarios; Examples data belongs in Stack-local feature copies; canonical files MAY include one illustrative row but MUST NOT enumerate all test cases.
- RA version bumped from v1.9 to v1.10, date remains 2026-05-18.

### Status

`Accepted` — 2026-05-18

### Consequences

**Outcomes:**
- Test data now has a defined home for both Stack-local and shared scenarios, eliminating the ad-hoc placement that emerges in ungoverned multi-Stack projects.
- The scenario isolation rule converts a common source of order-dependent test failures (shared mutable data) into a normative violation, making it detectable by code review.
- The inline literal prohibition reinforces Section 5.4 parameterisation at the data layer, preventing canonical feature files from becoming encoded test suites.

**Trade-offs:**
- Requiring shared data to be documented in `subject-app-contract.md` adds a maintenance step when shared data is introduced or modified. This is intentional — shared data is a cross-Stack dependency and warrants explicit documentation.
- The "one illustrative Examples row" allowance in canonical feature files is a compromise. Some teams prefer no Examples in canonical files at all; others want the parameter format visible. The MUST NOT on enumeration prevents canonical files from becoming data tables while still allowing format documentation.

**Compliance note:**
- DEMOAPP001's `puzzles.json` is Stack-local (single Stack). It is in compliance with Section 5.6: Stack-local location, never modified by scenarios (scenarios read it, create in-memory solver instances). No remediation required.

### Alternatives Considered

**Alternative: Leave test data entirely to Stack-level documentation**
- Description: Keep the RA silent on test data; each Stack documents its own approach.
- Rejected because: In a multi-Stack project, shared test data must be governed at the architecture level. Stack-level documentation cannot specify the canonical location for data shared between Stacks.

**Alternative: Require all test data to live in features-shared/**
- Description: Treat test data the same as feature files — one canonical store.
- Rejected because: Test data is language-specific in format (JSON, CSV, XML, database seeds). A single canonical store would require format negotiation across all Stacks, eliminating the language-agnosticism that is a core design principle of this architecture.

### Related Decisions

- DR-018 — Gherkin parameterisation; Section 5.6 inline literal prohibition directly reinforces DR-018.
- DR-024 — Feature Change Governance; Section 5.6 treats shared test data changes as breaking changes, governed by the same gate sequence.

---

## DR-027 — Add verification method column and automation requirement to Section 8.4 in RA v1.12 (RA-009)

**Date:** 2026-05-18
**Status:** Accepted — 2026-05-18

### Context

`reference-architecture.md` Section 8.4 defined five criteria for declaring a Stack in parity but specified no verification method for any of them. Appendix B provided a manual quick-reference checklist. Neither the section nor the appendix stated whether verification was expected to be manual, scripted, or enforced as a CI gate. This project already had automated coverage for two of the five criteria (feature parity report script for criterion 1, memory key parity checker for criterion 2) but the RA did not acknowledge this distinction or mandate automation for any criterion. A checklist completed manually is subject to human error and is insufficient as a parity gate in a multi-Stack project. The gap was identified and documented as Risk 10 (Low) in the structural review `DOCS/.review/2026-05-18_reference-architecture-structural-review.md`.

### Decision

Update Section 8.4 of `reference-architecture.md` v1.12:

- **Replace numbered list with a table** containing columns: criterion number, criterion description, verification method, and automated/manual designation.
- **Criteria 1 (scenario presence):** Verification method is the feature parity report script; designated MUST be automated.
- **Criteria 2 (Memory key values):** Verification method is the memory key parity checker; designated MUST be automated.
- **Criteria 3 (step text match):** Verification method is automated diff against canonical feature file; designated MUST be automated (tooling in place or planned).
- **Criteria 4 (component signatures):** Manual review against parity contract document; noted as future automation candidate.
- **Criteria 5 (no unacknowledged gaps):** Manual review of open backlog items.
- **Normative automation statement (MUST):** A Stack MUST NOT be declared in parity based solely on manual checklist completion. Criteria 1, 2, and 3 MUST be verified by an automated tool before a parity declaration is made.
- Appendix B checklist retained as a useful pre-review aid, explicitly noted as not satisfying the automation requirement for criteria 1–3.
- RA version bumped from v1.11 to v1.12, date remains 2026-05-18.

### Status

`Accepted` — 2026-05-18

### Consequences

**Outcomes:**
- The automation requirement for the highest-frequency parity failure modes (scenario presence, Memory key values, step text) is now normative — projects can be audited for compliance.
- Criteria 4 and 5 remain manual by design, not by omission; the table makes this explicit and frames criterion 4 as a future automation target.
- The separation between the checklist (quick aid) and the automated gate (normative requirement) removes the ambiguity that allowed teams to satisfy the RA by ticking boxes without running tools.

**Trade-offs:**
- Criterion 3 (step text match) currently has no dedicated automation script in this project; the parity report checks scenario presence but not individual step text within a scenario. Marking it MUST be automated creates a compliance gap until a step-text diff tool is implemented. This gap is acknowledged — it should be tracked as a backlog item.
- The normative statement elevates the automation requirement from best practice to MUST, which increases the compliance burden for single-Stack projects. The trade-off is acceptable because single-Stack projects have only one Stack to verify and the tooling cost is low.

**Compliance note:**
- DEMOAPP001: criterion 1 is automated (parity report), criterion 2 is automated (memory key checker). Criterion 3 (step text automation) is a gap — a new backlog item should be created if actioning this in full. Criteria 4 and 5 are manual, as specified.

### Alternatives Considered

**Alternative: Keep the manual checklist as the sole parity verification mechanism**
- Description: Leave Section 8.4 as a numbered list with no verification method specification; rely on Appendix B.
- Rejected because: Manual checklists do not scale to multi-Stack projects with independent language implementations. Criterion 2 (Memory key values) is the exact case where a value like `SOLVE_RESULT = 'solve_result'` passes every quality gate while being a silent parity defect. Only automated detection catches this class of error reliably.

**Alternative: Mandate full automation for all five criteria**
- Description: Require automated verification for all five criteria, including component signatures.
- Rejected because: Component signature verification (criterion 4) requires language-aware parsing of Screenplay component interfaces across multiple languages. This is technically complex and not yet solved. Mandating it without tooling would make the requirement permanently unmet.

### Related Decisions

- DR-023 — Automated memory key parity checker; that checker satisfies criterion 2 of Section 8.4 as specified here.
- DR-010 (feature parity report); that script satisfies criterion 1 of Section 8.4 as specified here.

---

## DR-028 — Add shared packages/ directory specification as Section 4.4 to RA v1.13 (RA-010)

**Date:** 2026-05-18
**Status:** Accepted — 2026-05-18

### Context

`reference-architecture.md` Section 4 showed `packages/` in the directory blueprint as "Shared code packages (OPTIONAL)" with no further specification. In a multi-Stack project, shared utilities (e.g. a common data loader, shared type definitions, or a language-agnostic utility library) will naturally emerge as the project grows. Without rules, `packages/` becomes an ungoverned vector for parity defects: Stack-specific code migrates there, test runner dependencies leak in, and interface changes break dependent Stacks without a defined coordination path. The gap was identified and documented as Risk 11 (Low) in the structural review `DOCS/.review/2026-05-18_reference-architecture-structural-review.md`.

### Decision

Add Section 4.4 "Shared Packages Directory" to `reference-architecture.md` v1.13:

- **Contents rules (MUST NOT):** No Stack-specific code, no test runner imports, no Stack-local configuration. Subject Application source MUST NOT live in `packages/` unless it is a pure utility library with no Stack-specific dependencies.
- **Contents rules (MAY):** Shared data loaders/fixture helpers, language-agnostic utility functions, shared type definitions used across Stacks in the same language family.
- **Independent versioning (MUST):** Each package MUST be independently versioned.
- **Change governance (MUST):** Any change to a package's public interface MUST be treated as a breaking change (Section 5.5), MUST produce a DR entry, and MUST be followed by a parity verification run against all dependent Stacks.
- **Parity relationship:** Shared package failures are project-level breaking changes, not Stack parity defects. Must be resolved before any Stack is declared in parity.
- RA version bumped from v1.12 to v1.13, date remains 2026-05-18.

### Status

`Accepted` — 2026-05-18

### Consequences

**Outcomes:**
- `packages/` transitions from an unspecified optional directory to a governed zone with explicit content rules and change coordination requirements.
- The prohibition on Stack-specific code and test runner imports prevents the most common anti-pattern: using `packages/` as a dumping ground for code that should live in the Stack itself.
- Treating public interface changes as breaking changes (Section 5.5) ensures that Stacks are not silently broken by an upstream package change.

**Trade-offs:**
- Requiring independent versioning for each package adds overhead for small projects. A single-Stack project with one optional utility package will experience this overhead without a clear benefit. The trade-off is acceptable because the rule scales to multi-Stack projects where independent versioning is essential.
- The change governance requirement (DR entry for every public interface change) is intentionally strict. Projects that iterate rapidly on shared utilities will find this friction. The alternative — ungoverned shared packages — produces the exact fragmentation and coupling problems the architecture is designed to prevent.

**Compliance note:**
- DEMOAPP001 currently uses no `packages/` directory. `puzzles.json` is Stack-local. No remediation required. When DEMOAPP002 is onboarded, any shared data loader should be placed in `packages/` and governed per this section.

### Alternatives Considered

**Alternative: Leave packages/ entirely unspecified and document in Stack-level docs**
- Description: Keep the RA silent; each Stack documents how it consumes shared packages.
- Rejected because: Shared packages are a project-level construct, not a Stack-level construct. Stack-level documentation cannot specify the canonical rules for a directory shared between Stacks.

**Alternative: Prohibit packages/ entirely and require Stack-level duplication**
- Description: Remove `packages/` from the blueprint; all code that would go there must be duplicated per Stack.
- Rejected because: Duplication of a language-agnostic utility (e.g. a JSON puzzle loader that works identically in all Stacks) violates DRY without benefit. The parity problem the RA is solving is behavioral contract parity, not code duplication. Shared infrastructure utilities are appropriate candidates for a shared directory when governed correctly.

### Related Decisions

- DR-024 — Feature Change Governance (Section 5.5); shared package interface changes are treated as breaking changes under the same gate sequence.
- DR-027 — Section 8.4 parity verification; shared package failures must be resolved before parity is declared.
- DR-026 — Test Data Management (Section 5.6); shared test data referenced there should live in `packages/` or a dedicated `data/` directory, as now specified by Section 4.4.

---

## DR-029 — Use DOCS/.review as the authoritative review output location

**Date:** 2026-05-20
**Status:** Accepted — 2026-05-20

### Context

DR-014 moved future review outputs to repository-root `.review/` to satisfy Reference Architecture v1.3. In practice this created two review locations: historical reviews under `DOCS/.review/` and newer reviews under root `.review/`. That split works against the repository's established documentation structure, where project governance, planning, implementation logs, templates, and reviews are co-located under `DOCS/`.

The project now chooses `DOCS/.review/` as the single authoritative location for all review outputs. The Reference Architecture is updated to v1.14 so this is a normative architecture rule rather than a project-only exception.

### Decision

Update `reference-architecture.md` v1.14 Section 10.7 to require review outputs under `DOCS/review/`, with project naming conventions allowed to adapt the concrete path. This repository uses the concrete path `DOCS/.review/` per DR-001 and `DOCS/.design/naming-conventions.md`.

All future review outputs MUST be created under `DOCS/.review/`:

- Single-file structural reviews: `DOCS/.review/YYYY-MM-DD_[scope-slug].md`
- Multi-file review bundles: `DOCS/.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/`

Repository-root `.review/` MUST NOT be used by this project. Existing root `.review/` contents are moved into `DOCS/.review/`, and active prompts/templates must be updated so automated agents do not recreate the root directory.

### Consequences

**Outcomes:**
- Review outputs return to a single discoverable documentation location.
- `DOCS/.review/` now contains both historical v1.2-shaped bundles and current v1.3+ shaped review outputs.
- The Reference Architecture and project decision register agree on the active review directory rule.
- DR-014 is superseded.

**Trade-offs:**
- This reverses the previous literal root-path interpretation in DR-014, so active references to root `.review/` must be updated.
- Historical documents and old implementation logs may still mention root `.review/` as past state; those are not active workflow instructions.

**Compliance note:**
- `DOCS/.review/` follows the project's dot-prefixed DOCS subdirectory convention from DR-001.
- DR-012 continues to govern the current multi-file bundle naming shape; this decision changes location, not bundle shape.

### Alternatives Considered

**Alternative: Keep both root `.review/` and `DOCS/.review/`**
- Description: Leave existing root reviews in place and write future reviews to `DOCS/.review/`.
- Rejected because: Two locations create avoidable ambiguity for agents and reviewers.

**Alternative: Keep root `.review/` and update only prompts**
- Description: Preserve DR-014 and continue treating `DOCS/.review/` as historical.
- Rejected because: It conflicts with the user's approved repository organization and keeps review artefacts outside the documentation tree.

### Related Decisions

- DR-001 — Dot-prefix convention for DOCS subdirectories.
- DR-010 — Earlier decision placing code review outputs under `DOCS/.review/`.
- DR-012 — Current comprehensive review bundle naming convention.
- DR-014 — Superseded root `.review/` decision.

---

## DR-030 — Use DOCS/.analysis for analysis and report-style documents

**Date:** 2026-05-20
**Status:** Accepted — 2026-05-20

### Context

Several analysis and report-style documents were stored directly in the `DOCS/` root alongside the master index and Reference Architecture. This made the root harder to scan and left no clear destination for future one-time assessments that are not code reviews and not implementation logs.

The project already uses type-specific dot-prefixed DOCS subdirectories under DR-001 and DR-019. Analysis/report documents are a distinct document type and should follow that same organization model.

### Decision

Create `DOCS/.analysis/` as the authoritative location for analysis and report-style documents.

Move existing report-style documents into that directory while preserving historical filenames:

- `DOCS/.analysis/documentation-review-20260514T1100Z.md`
- `DOCS/.analysis/ref-arch-alignment_2026-05-14.md`
- `DOCS/.analysis/ref-arch-alignment_2026-05-15.md`
- `DOCS/.analysis/analysis-directory-naming-kebab-case-2026-05-16.md`
- `DOCS/.analysis/analysis-docs-subdirectory-cleanup-20260516.md`
- `DOCS/.analysis/analysis-document-naming-kebab-case-20260516.md`

Future analysis and report-style documents MUST be created under `DOCS/.analysis/` unless another governed directory is more specific:

- Code review outputs remain under `DOCS/.review/`.
- Development session logs remain under `DOCS/.implementation-logs/`.
- Design specifications remain under `DOCS/.design/`.

### Consequences

**Outcomes:**
- The DOCS root is reserved for the master index and governing Reference Architecture.
- Analysis/report documents have a discoverable home and directory-level README.
- New analysis reports follow the existing dot-prefixed DOCS directory convention.

**Trade-offs:**
- Existing links to report documents require path updates.
- Historical report filenames are not normalized in this move, so a small amount of legacy naming remains inside `DOCS/.analysis/`.

**Compliance note:**
- This is a project-local documentation organization decision. It does not change the Reference Architecture's mandatory document set.
- DR-020 continues to govern future document filenames; historical report filenames are preserved to avoid combining relocation with renaming.

### Alternatives Considered

**Alternative: Keep analysis reports in DOCS root**
- Description: Leave all reports beside `README.md` and `reference-architecture.md`.
- Rejected because: The DOCS root becomes a mixed collection of index, governance, and historical analysis files, which weakens scanability.

**Alternative: Put analysis reports under `DOCS/.design/`**
- Description: Treat reports as design-adjacent documents.
- Rejected because: Reports include migration audits and alignment assessments, not only design specifications. A dedicated folder is clearer.

### Related Decisions

- DR-001 — Dot-prefix convention for DOCS subdirectories.
- DR-019 — Dot-prefix convention extended to all DOCS type-specific directories.
- DR-020 — Kebab-case convention for authored document filenames.
- DR-029 — Separate rule for review outputs under `DOCS/.review/`.

---

## DR-031 — Align Reference Architecture Section 4 blueprint with current project layout

**Date:** 2026-05-20
**Status:** Accepted — 2026-05-20

### Context

Reference Architecture v1.14 Section 4 directory blueprint contained several mismatches with the current project layout:

1. DOCS subdirectories were shown with plain names (`algorithm/`, `architecture/`, `design/`, `planning/`, `implementation-logs/`, `review/`, `templates/`) rather than the dot-prefixed names established by DR-001 and DR-019.
2. The Stack directory pattern showed `[STACK_NAME]/` at repository root, not the `demo-apps/[stack-dir]/` Stack group pattern in use.
3. `step_definitions/` was shown beside `screenplay/`, not inside it as the Screenplay Parity Contract and actual implementation place it.
4. The API integration test folder `tests/api/` was absent from the blueprint.
5. `DOCS/.analysis/` (added by DR-030) was absent from the blueprint.
6. All RA-internal path references outside Section 4 (Sections 5, 8, and 10) used the plain-name DOCS subdirectory form, mismatching the dot-prefixed convention.
7. An empty untracked `DOCS/implementation-logs/` directory (plain name) existed locally, conflicting with DR-019.

### Decision

1. Bump Reference Architecture version from v1.14 to v1.15.
2. Rewrite Section 4 blueprint to reflect the current project layout:
   - Stack group shown as `[stack-group-dir]/[stack-dir]/` with an OPTIONAL annotation referencing Section 4.3.
   - DOCS subdirectories updated to dot-prefixed form matching DR-001/DR-019: `.algorithm/`, `.analysis/`, `.architecture/`, `.design/`, `.howto/`, `.implementation-logs/`, `.planning/`, `.review/`, `.templates/`.
   - `tests/api/` shown as an OPTIONAL subfolder of `[test-src]/`.
   - `step_definitions/` shown inside `screenplay/`, consistent with the Screenplay Parity Contract and actual DEMOAPP001/DEMOAPP002 structure.
   - `fixtures/` shown inside `screenplay/` as OPTIONAL.
3. Update all RA-internal path references outside Section 4 to use the dot-prefixed form.
4. Remove the empty untracked `DOCS/implementation-logs/` directory locally.

### Consequences

**Outcomes:**
- Section 4 blueprint now accurately describes the current project layout; agents reading the RA derive correct paths on first read.
- All normative path references in the RA use dot-prefixed DOCS subdirectory names, consistent with DR-001 and DR-019.
- The empty plain-name directory is removed, eliminating a potential naming-convention violation.

**Trade-offs:**
- Projects adopting this RA whose DOCS subdirectories use plain names must adjust path references in their own implementations. The Section 4 note on illustrative directory names continues to apply: structural roles are REQUIRED, exact names are convention-governed.

**Compliance note:**
- Changing normative path guidance in the RA is a structural rule change requiring a DR entry per RA §10.6.

### Alternatives Considered

**Alternative: Keep plain-name DOCS paths in RA, add a cross-reference note**
- Description: Leave the blueprint unchanged and add a note in Section 4 pointing to the dot-prefixed DOCS subdirectory convention.
- Rejected because: The RA would contain paths that no project using this convention actually uses; agents reading the RA would produce non-compliant paths.

### Related Decisions

- DR-001 — Dot-prefix convention for DOCS subdirectories.
- DR-019 — Dot-prefix convention extended to all DOCS type-specific directories.
- DR-029 — Review outputs under `DOCS/.review/`.
- DR-030 — Analysis documents under `DOCS/.analysis/`.

---

## DR-032 — Add C# SpecFlow parity Stack

**Date:** 2026-05-28
**Status:** Accepted — 2026-05-28

### Context

BACKLOG-021 and BACKLOG-013 required the planned C# Stack to become an active parity implementation. The Reference Architecture onboarding checklist requires a recorded decision before adding a new Stack so future agents know the canonical Stack name, filesystem location, surface type, and framework choice.

### Decision

Add `DEMOAPP003_CSHARP_SPECFLOW` as an active @util Stack at `demo-apps/demoapp003-csharp-specflow/`. Use .NET 8, SpecFlow, and NUnit to execute the same canonical Gherkin feature contract as DEMOAPP001 and DEMOAPP002.

### Status

`Accepted` — 2026-05-28

### Consequences

**Outcomes:**
- The project now has three active parity Stacks: TypeScript, Python, and C#.
- Parity automation must include C# feature and Memory key files.
- BACKLOG-013 is covered by the implementation scope of BACKLOG-021.

**Trade-offs:**
- CI, Docker Compose, and local validation now include a .NET toolchain.
- The C# Stack carries NuGet package restore and SpecFlow code-generation dependencies.

**Compliance note:**
- This aligns with RA Section 11 onboarding and DR-004's sequential TypeScript to Python to C# migration strategy.

### Alternatives Considered

**Alternative: Use NUnit tests without SpecFlow**
- Description: Parse or duplicate scenario coverage directly in NUnit.
- Rejected because: It would not execute the canonical Gherkin contract through a BDD runner.

**Alternative: Use Reqnroll instead of SpecFlow**
- Description: Use the actively maintained SpecFlow successor package.
- Rejected because: The backlog item and Stack name explicitly identify SpecFlow; changing framework identity would require a separate backlog/decision update.

### Related Decisions

- DR-003 — In-process (@util) surface for DEMOAPP001 tests.
- DR-004 — Sequential Stack migration strategy.
- DR-016 — Stack filesystem directory naming.
- DR-023 — Automated Memory key parity enforcement.
- DR-027 — Automated step-text parity verification.

---

## DR-033 — Multi-Stack Local Containerization (Docker Compose)

**Date:** 2026-05-29
**Status:** Accepted — 2026-05-29

### Context

BACKLOG-010 requested a local development environment setup using Docker Compose to facilitate offline multi-stack execution, parity verification, and performance benchmarking across all parity stacks without requiring developers to preconfigure multi-language SDKs (Node, Python, .NET) on their host machine. The Docker Desktop and container runtime environment must be robust, low-footprint to handle host memory constraints, and support standard development volumes to prevent files lock and caching bottlenecks.

### Decision

Implement containerization via a top-level `docker-compose.yml` incorporating the following components:
1. Low-footprint, Alpine/slim-based Dockerfiles for each Stack (`demoapp001-tests`, `demoapp002-tests`, `demoapp003-tests`).
2. Live development profile `api` exposing `demoapp001-api` on port `3000`.
3. Standalone `parity-checks` service for local verification running existing PowerShell scripts.
4. Profiling profile `benchmark` defining `performance-benchmarks` executing the performance harness inside Python, TypeScript, and .NET.
5. Standardized volume mounting mapping `/workspace` to project root, combined with aggressive `.dockerignore` filters to isolate runtime and output states.

### Status

`Accepted` — 2026-05-29

### Consequences

**Outcomes:**
- The entire multi-stack ecosystem (TypeScript, Python, C#) is compiled and verified in standard, repeatable environments.
- Developers can execute parity-checks and benchmarking directly inside temporary containers.
- Reduced host machine dependency setup.

**Trade-offs:**
- Requires modern Docker and Compose v2 installed.
- Host physical RAM limitations can constrain concurrent process execution (e.g. WSL backend thrashing under heavy BuildKit downloads or container startups when host has low available memory). This is mediated by transitioning to alpine/slim base images (e.g., `node:20-alpine` over `node:20-bookworm`).

**Compliance note:**
- Aligns with RA Section 9.1 orchestration, Section 5 test data mapping, and standardizes multi-stack boundaries.

### Alternatives Considered

**Alternative: Complete VM pre-seed image**
- Description: Distribute a complete Vagrant or VirtualBox VM containing the entire project.
- Rejected because: Too heavyweight, slow boot times, and hard to run in standard modern CI/CD setups.

### Related Decisions

- DR-003 — In-process (@util) surface for DEMOAPP001 tests.
- DR-016 — Stack filesystem directory naming.
- DR-032 — Add C# SpecFlow parity Stack.

---

## DR-035 — Validation layer boundaries: loaders structural-only, OpenAPI contract adopted, strict loader mode deferred

**Date:** 2026-06-13
**Status:** Accepted — user decision 2026-06-12, documented 2026-06-13

### Context

Code review `DOCS/.review/CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z/` (Risk 4, Medium) found that constraint validation is implemented unevenly relative to v1.0's optional guidance: loaders validate structure (shape/range/integer), solvers expose a constraint query, and only the DEMOAPP001 REST API offers an explicit constraint-validation surface. The split is intentional but was undocumented, and the review suggested considering an optional strict duplicate-validation mode on loaders. The review also recommended (Refactor 5) an OpenAPI contract if the TypeScript REST API is a stable public surface.

### Decision

1. **Document the validation layer split as authoritative:** loaders perform structure validation only (v1.0 §7.1, fail-fast, identical wording across stacks); solvers expose a constraint *query* (`noConstraintViolations` / `no_constraint_violations` / `NoConstraintViolations`) without gating solving on it; the DEMOAPP001 REST API re-validates structure on every grid-accepting endpoint and offers constraint validation on demand via `POST /api/validate`. The authoritative statement is `DOCS/.architecture/validation-boundaries.md`, which platform specification v1.1 §2.2 (row 4) defers to.
2. **Adopt an authored OpenAPI 3.0 contract** for the DEMOAPP001 REST API at `demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml`, describing implemented behaviour; it must be updated in the same change as any endpoint or schema change.
3. **Do not adopt the optional strict duplicate-validation loader mode** — explicitly deferred (user decision, 2026-06-12), not an open question. Revisiting requires a new decision-register entry.

### Status

`Accepted` — user decision 2026-06-12 (worklist item SUD-04); documents landed 2026-06-13.

### Consequences

**Outcomes:**
- Layer responsibilities are stated once, identically for all three stacks; reviewers assess loaders against structure-only expectations.
- The REST API has a stable, citable HTTP contract; API changes carry a documentation obligation.
- Structurally valid but logically contradictory grids remain accepted by technique/solve surfaces with behaviour undefined by v1.0 — now documented rather than implicit.

**Trade-offs:**
- The OpenAPI document is authored, not generated, so it can drift if the same-change update rule is not honoured.
- Callers needing legality assurance must request it explicitly (solver query or `POST /api/validate`).

**Compliance note:**
- Document naming follows DR-020 (kebab-case). The boundaries doc lives in `DOCS/.architecture/` alongside the other cross-cutting contracts; the OpenAPI file lives with the stack that implements the surface.

### Alternatives Considered

**Alternative: Optional strict duplicate-validation mode on loaders**
- Description: A loader flag performing row/column/block duplicate detection at load time.
- Rejected because: `puzzles.json` is curated fixture data already covered by the solver query, the API validate endpoint, and the test suites; a behavioural switch would blur the layer split and add three-stack parity surface for no test benefit. Deferred by explicit user decision, not left open.

**Alternative: Generate the OpenAPI document from code annotations**
- Description: Derive the contract via swagger-jsdoc or similar tooling.
- Rejected because: The Express wrapper is small and stable; an authored document avoids adding a build-time dependency and annotation noise to `app_src/server/`, at the cost of the same-change update rule.

### Related Decisions

- DR-020 — kebab-case document naming.
- DR-034 — v1.1 platform specification (its §2.2 row 4 defers layer responsibilities to the boundaries doc).

---

## Proposed Decisions

## DR-034 — Adopt v1.1 platform specification evolving the v1.0 baseline

**Date:** 2026-06-12
**Status:** Proposed — accepted when the pull request carrying `DOCS/.design/sudoku-solver-platform-specification.md` is merged

### Context

Code review `DOCS/.review/CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z/` (Risk 1, High) found that the repository's capabilities — row/column/block Hidden Singles, audit trail, REST API, web visualisation, Docker Compose, performance tooling, and multi-stack parity governance — exceed the scope of `DOCS/.design/sudoku-solver-specification.md` v1.0. With v1.0 as the sole implementation authority, maintainers risk misclassifying intentional evolution as drift, and reviewers risk generating false positives against the older baseline. A platform-level specification was needed that classifies every capability without discarding v1.0's algorithmic detail.

### Decision

Adopt `DOCS/.design/sudoku-solver-platform-specification.md` v1.1 as the authoritative platform specification. It is numbered v1.1 as an **evolution** of the v1.0 baseline, not a supersession (user decision, 2026-06-12); v1.0 remains in place as the original core baseline for core-solver algorithmic detail. The v1.1 document promotes row/column/block Hidden Singles to an explicit requirement, classifies deliberate extensions and staged-capability surfaces, and states the stack parity rules. Acceptance occurs when the user merges the pull request carrying the document; root `README.md` version/status metadata is updated only after that merge.

### Status

`Proposed` — 2026-06-12. Becomes `Accepted` on merge of the carrying pull request (worklist item SUD-02).

### Consequences

**Outcomes:**
- Current implemented behaviour (e.g. row/column/block Hidden Singles) is requirement, not drift; future reviews assess against v1.1.
- New stack authors read v1.0 for solver algorithms and v1.1 for platform obligations and optional surfaces.
- API/web surfaces are formally staged capability with a roadmap for DEMOAPP002/003, not a parity failure.

**Trade-offs:**
- Two specification documents must be read together; v1.1 Section 2.2 is the single reconciliation table and must be kept current.
- README metadata lags until the acceptance merge.

**Compliance note:**
- Aligned with RA v1.15: parity governance remains in the RA; v1.1 summarises and defers to it. Document naming follows DR-020 (kebab-case).

### Alternatives Considered

**Alternative: Number the new specification v2.0 and supersede v1.0**
- Description: Mark v1.0 as superseded and carry all algorithmic detail forward into a single v2.0 document.
- Rejected because: The user confirmed (2026-06-12) the document is an evolution — v1.0's algorithmic content remains correct and authoritative for the core solver; duplicating ~900 lines into v2.0 would create a divergence risk with no benefit.

**Alternative: Patch v1.0 in place with extension sections**
- Description: Edit `sudoku-solver-specification.md` to add the extensions, parity rules, and staged surfaces.
- Rejected because: It would blur the historical baseline the review asked to preserve, and platform governance (parity, staged capability) is a different concern and audience from the language-agnostic solver algorithm design.

### Related Decisions

- DR-012 — Reference Architecture adoption (parity governance the v1.1 spec defers to).
- DR-020 — kebab-case document naming (governs the new file's name).
- DR-033 — Docker Compose containerization (classified as a deliberate extension by v1.1).

---

---

## Superseded Decisions

*None at this time.*

---

## Deprecated Decisions

*None at this time.*

---

*Last entry: DR-035 (Accepted); DR-034 remains Proposed. Next ID: DR-036.*
*Any change to a normative rule in this register MUST be applied to all Stacks simultaneously.*
