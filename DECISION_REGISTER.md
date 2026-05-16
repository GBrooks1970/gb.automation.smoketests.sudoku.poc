# Decision Register

**Project:** gb.automation.smoketests.sudoku.poc
**Last Updated:** 2026-05-16
**Governed by:** `REFERENCE_ARCHITECTURE.md` v1.3 §10.6
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

All type-specific subdirectories inside `DOCS/` use a leading dot: `.design/`, `.planning/`, `.implementation/`, `.review/`, `.algorithm/`, `.howto/`. Future DOCS subdirectories follow the same pattern.

### Consequences

**Outcomes:**
- Directories sort before document files in most file-system tools (dot-first ordering).
- The leading dot provides an immediately recognisable visual marker in the DOCS tree.

**Trade-offs:**
- This convention is not prescribed by the Reference Architecture, which uses plain names (`algorithm/`, `planning/`, `implementation-logs/`). This is a documented divergence.
- New contributors must learn the convention explicitly — it is not standard in the wider community.

**Compliance note:**
- Documented divergence from `REFERENCE_ARCHITECTURE.md` §4 directory blueprint. Acceptable because the Reference Architecture explicitly permits MAY-level variation in folder naming beyond the structural roles it describes.

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

The Screenplay migration (Phases 2–4 of the migration plan documented in `ANALYSIS_Screenplay_BDD_Architecture_Alignment_20260514.md`) replaces procedural step definitions with Screenplay components. A question arose: should the Gherkin feature file also be refactored at the same time? The feature file has some over-specified steps (inline array values) that would ideally be parameterised.

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

The Reference Architecture was updated from v1.0 to v1.1 on 2026-05-14. Two path requirements changed: `BACKLOG.md` moved from a root-level requirement to `DOCS/.planning/BACKLOG.md`, and `NAMING_CONVENTIONS.md` was pinned from "root or DOCS/" to specifically `DOCS/.design/NAMING_CONVENTIONS.md`. Phase 0 had already been executed against v1.0, placing both documents at the wrong paths.

### Decision

Adopt RA v1.1 as the governing version. Correct the two path errors introduced by Phase 0:
1. Move `NAMING_CONVENTIONS.md` from repository root to `DOCS/.design/NAMING_CONVENTIONS.md` (applying the DR-001 dot-prefix convention to the RA's `DOCS/design/` requirement).
2. Demote the root `BACKLOG.md` from a required document to a convenience summary redirect; the required document is `DOCS/.planning/BACKLOG.md`, which already existed before Phase 0.

### Consequences

**Outcomes:**
- The project is now governed by RA v1.1, which is more specific about document paths.
- `NAMING_CONVENTIONS.md` is co-located with design documents in `DOCS/.design/`, consistent with DR-001.
- `DOCS/.planning/BACKLOG.md` remains the single authoritative backlog.

**Trade-offs:**
- The root `BACKLOG.md` created in Phase 0 is now a non-required convenience file. It must include a clear redirect to `DOCS/.planning/BACKLOG.md` to avoid confusion.
- Any external links or CLAUDE.md references that pointed to root `NAMING_CONVENTIONS.md` must be updated.

**Compliance note:**
- `DOCS/.design/NAMING_CONVENTIONS.md` maps to the RA v1.1 requirement `DOCS/.design/NAMING_CONVENTIONS.md` via DR-001 (dot-prefix convention).

### Alternatives Considered

**Alternative: Continue under v1.0**
- Description: Do not adopt v1.1; keep documents at v1.0 paths.
- Rejected because: v1.1 is the accepted version of the governing architecture. Using a superseded version would invalidate the compliance roadmap.

**Alternative: Move documents to RA-literal paths (no dot-prefix)**
- Description: Place files at `DOCS/.design/NAMING_CONVENTIONS.md` literally, without dot-prefix.
- Rejected because: DR-001 is an accepted decision. Introducing a single non-dot-prefixed DOCS subdirectory would create inconsistency within the DOCS tree.

### Related Decisions

- DR-001 — Dot-prefix convention applied to map `DOCS/design/` → `DOCS/.design/`
- DR-005 — NAMING_CONVENTIONS.md content derived from work done under Phase 0

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

The Screenplay migration design (`DESIGN_Screenplay_Migration.md`) was authored against an earlier version of Serenity/JS. When implementing Phase 2 against the installed version (3.43.2), two deviations from the design were required due to API changes in the library.

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
- `DESIGN_Screenplay_Migration.md` should be updated to reflect the `extends Ability` pattern and path corrections (post-Phase-4 clean-up task).

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

Adopt REFERENCE_ARCHITECTURE.md v1.2 (2026-05-15) as the governing architecture. Execute normalization work across four domains:

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
**Status:** Accepted — 2026-05-15

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

`REFERENCE_ARCHITECTURE.md` was updated to v1.3 on 2026-05-15. The v1.3 update makes the repository-root code review directory requirement explicit and states that the multi-file review bundle convention is recorded in the Decision Register as DR-012. Without this decision, the project would continue to claim alignment through v1.2-era entries while the current accepted architecture requires v1.3 governance and DR-012 provenance.

### Decision [REQUIRED]

Adopt `REFERENCE_ARCHITECTURE.md` v1.3 as the governing architecture for this repository. Use DR-012 as the authoritative decision for future multi-file code review bundle naming: future comprehensive review bundles MUST use `.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/` with a main index file named `00_CODE_REVIEW_[AGENT]_v[N]_[UTC].md`, where `[UTC]` uses `YYYYMMDDTHHMMZ`.

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

### Alternatives Considered [REQUIRED]

**Alternative: Keep DR-011 as the review bundle authority**
- Description: Continue treating DR-011 as the governing review output decision and avoid adding a new DR-012 entry.
- Rejected because: v1.3 explicitly names DR-012 as the recorded extension for multi-file review bundles.

**Alternative: Rename historical review bundles immediately**
- Description: Move and rename all existing review bundle directories to the v1.3 naming convention.
- Rejected because: review outputs are read-only once written. Historical bundle names should remain intact, with v1.3 applied to future outputs and compatibility locations.

### Related Decisions

- DR-009 — Historical adoption of `REFERENCE_ARCHITECTURE.md` v1.2.
- DR-010 — Historical review directory placement under `DOCS/.review/`.
- DR-011 — Historical v1.2 review bundle shape.

---

## DR-013 — Add RA-literal DOCS compatibility paths
**Superseded by:** DR-019 (2026-05-16) — bridge directories removed; dot-prefix convention extended to all DOCS subdirectories

### Context [REQUIRED]

`REFERENCE_ARCHITECTURE.md` v1.3 requires literal documentation paths such as `DOCS/.planning/BACKLOG.md`, `DOCS/.design/NAMING_CONVENTIONS.md`, and `DOCS/.implementation-logs/`. This repository already has accepted historical dot-prefixed documentation directories under DR-001: `DOCS/.planning/`, `DOCS/.design/`, and `DOCS/.implementation/`. Moving the authoritative documents immediately would create a broad path migration and risk breaking existing references while MIG-09 still needs to normalize implementation log policy.

### Decision [REQUIRED]

Keep the dot-prefixed DOCS directories as the authoritative content locations for existing planning, design, and implementation-log documents until a later decision supersedes this one. Add v1.3 literal compatibility paths that point agents and validators to the authoritative locations: `DOCS/.planning/BACKLOG.md`, `DOCS/.design/NAMING_CONVENTIONS.md`, and `DOCS/.implementation-logs/README.md`.

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
- Description: Move `DOCS/.planning/BACKLOG.md`, `DOCS/.design/NAMING_CONVENTIONS.md`, and all `DOCS/.implementation/` logs into the v1.3 literal directories.
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

`REFERENCE_ARCHITECTURE.md` v1.3 requires a repository-root `code-review/` or `.review/` directory for code review outputs. Historical project reviews currently live under `DOCS/.review/` and use the earlier `CODE_REVIEW_{Reviewer}__{UTC_TIMESTAMP}` naming shape. Those historical review outputs are read-only snapshots, so renaming or moving them would rewrite provenance rather than improve future compliance.

### Decision [REQUIRED]

Create repository-root `.review/` as the v1.3 location for future code review outputs. Future comprehensive reviews MUST use `.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/` and include a main index named `00_CODE_REVIEW_[AGENT]_v[N]_[UTC].md`; historical reviews remain unchanged under `DOCS/.review/` and are treated as a read-only archive.

### Status [REQUIRED]

`Accepted` — 2026-05-15

### Consequences [REQUIRED]

**Outcomes:**
- The repository now satisfies the v1.3 root review directory requirement.
- Future review naming is aligned with DR-012 and v1.3 Section 10.7.
- Historical review bundles remain intact and traceable.

**Trade-offs:**
- Review outputs now have a historical archive location and a future authoritative location.
- Agents must consult the root `.review/README.md` before creating new reviews.
- Existing links to `DOCS/.review/` remain valid but should be understood as historical, not the target for new reviews.

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

---

## DR-015 — Actor Memory via TakeNotes and thin step definitions (MIG-04 / MIG-05)

**Date:** 2026-05-16
**Status:** Accepted — 2026-05-16

### Context

`REFERENCE_ARCHITECTURE.md` v1.3 §3.5 requires that Memory keys be defined as named constants, and that Tasks write to Actor Memory while Questions read from it. Prior to MIG-04, the six constants in `tests/screenplay/support/memory-keys.ts` were defined but unused at runtime — all cross-step state flowed through private fields on `UseSudokuSolver` instead of through named Actor Memory keys. This left a parity risk: the documented Memory contract was not the runtime contract.

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
- Implements `REFERENCE_ARCHITECTURE.md` v1.3 §3.3 (Tasks write Memory), §3.4 (Questions read Memory), §3.5 (Memory key constants), §2.1 (Layer 2 thin), §8.1 (Memory key parity).

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

The UPPER_SNAKE_CASE convention for the Stack group container (`DEMOAPPS/`) and Stack directory (`DEMOAPP001_TYPESCRIPT_CYPRESS/`) was adopted implicitly and was never recorded in the Decision Register. Analysis document `DOCS/ANALYSIS_Directory_Naming_Kebab_Case_2026-05-16.md` surfaced two problems with the current convention:

1. **Case-sensitivity trap** — The repository is developed on a Windows (case-insensitive) filesystem and pushed to a Linux-hosted remote (case-sensitive). UPPER_CASE directory names create a latent risk where path mismatches silently succeed locally but fail on CI. This risk will become active when a CI pipeline is wired (BACKLOG-004).
2. **Ecosystem friction** — Node.js, TypeScript, npm tooling, and modern CI/CD YAML all default to lowercase-hyphenated paths. UPPER_CASE directories require Shift-key input and are the outlier against `.batch/`, `.results/`, `features-shared/`, and all Screenplay subdirectories which are already lowercase.

`REFERENCE_ARCHITECTURE.md` v1.3 §4.3 explicitly states that the Stack group directory does not define the canonical Stack name, opening the path to decouple the two conventions.

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

The actual filesystem rename of existing directories is tracked as **MIG-13** in `DOCS/.planning/BACKLOG.md` and is scheduled as a dedicated sprint immediately before Stack 2 onboarding.

### Status

`Accepted` — 2026-05-16

### Consequences

**Outcomes:**
- Removes the case-sensitivity trap for all future Stacks and for DEMOAPP001 once MIG-13 completes.
- Makes Stack directory naming consistent with the ecosystem norm and with all other lowercase directories in the repository.
- `NAMING_CONVENTIONS.md` §3 and §4 updated to reflect the decoupling of directory name from canonical Stack name.
- Future Stack directories (`demo-apps/demoapp002-python-pytest/`, etc.) created with the correct convention from day one.

**Trade-offs:**
- MIG-13 requires updating approximately 220 references across ~80 files, including TypeScript path traversals, Cucumber config, orchestration scripts, and all documentation.
- Canonical Stack name retains UPPER_SNAKE_CASE, creating a visible divergence between directory name and Stack name that must be understood by all contributors and agents.

**Compliance note:**
- The directory name convention is a project-local decision not explicitly prescribed by `REFERENCE_ARCHITECTURE.md` v1.3. The RA §4.3 explicitly permits the group directory to use any name without affecting the canonical Stack name.

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

- `DOCS/ANALYSIS_Directory_Naming_Kebab_Case_2026-05-16.md` — full impact analysis with blast radius assessment and implementation plan.

---

## DR-017 — Make DOCS/.implementation-logs/ the authoritative implementation-log directory (MIG-09)
**Superseded by:** DR-019 (2026-05-16) — authoritative path is now `DOCS/.implementation-logs/`

**Date:** 2026-05-16
**Status:** Accepted — 2026-05-16

### Context

DR-013 created `DOCS/.implementation-logs/README.md` as a v1.3 compatibility bridge, leaving `DOCS/.implementation/` as the authoritative content location and explicitly deferring the path decision to MIG-09. `REFERENCE_ARCHITECTURE.md` v1.3 §10.8 names `implementation-logs/` as the required directory and requires log files to use UTC date-prefix plus short-slug naming (`YYYY-MM-DD_short-session-topic.md`). The two existing logs in `DOCS/.implementation/` use the legacy `IMPL_LOG_YYYY-MM-DD_Long_Title.md` pattern and are not in the v1.3-required location.

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
- Implements `REFERENCE_ARCHITECTURE.md` v1.3 §10.8 path and naming requirements.
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

`REFERENCE_ARCHITECTURE.md` v1.3 §5.4 states that steps that embed specific values inline SHOULD be refactored to accept those values as parameters, and §8.2 states that any change to step Gherkin text MUST be applied to all Stacks simultaneously and recorded in the Decision Register. Two canonical scenarios embedded inline array literals that block portability across future Stacks:

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
- Implements `REFERENCE_ARCHITECTURE.md` v1.3 §5.4 (parameterised steps) and §8.2 (step text parity across Stacks).
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

**RA path divergence:** `REFERENCE_ARCHITECTURE.md` v1.3 names `DOCS/.architecture/`, `DOCS/.templates/`, `DOCS/planning/`, `DOCS/design/`, and `DOCS/.implementation-logs/` as literal paths. All five diverge from this convention under the same MAY-level latitude clause that authorised DR-001. This is a documented project-local decision. The RA text is not changed.

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
- Documented divergence from `REFERENCE_ARCHITECTURE.md` v1.3 §4, §10.3, §10.5, §10.8, §10.9 path literals, at the MAY-level latitude clause for directory naming.
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

- `DOCS/ANALYSIS_DOCS_Subdirectory_Cleanup_20260516.md` — full discrepancy map, file inventory, and migration plan.

---

## Proposed Decisions

*None at this time.*

---

## Superseded Decisions

*None at this time.*

---

## Deprecated Decisions

*None at this time.*

---

*Last entry: DR-019. Next ID: DR-020.*
*Any change to a normative rule in this register MUST be applied to all Stacks simultaneously.*
