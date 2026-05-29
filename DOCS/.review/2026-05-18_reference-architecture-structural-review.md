# Structural Review: reference-architecture.md v1.3

**Reviewer:** AI assistant (CLAUDE Sonnet 4.6)
**Date:** 2026-05-18T00:00Z
**Subject:** `DOCS/reference-architecture.md` v1.3 — comprehensive structural review
**Scope:** Document design, normative completeness, internal consistency, pedagogical quality, risk assessment
**Review type:** Independent structural audit — reviewed as if encountering the document for the first time

---

## Methodology

This review treats the document as a standalone specification, assessing it against its own stated goals: to be language-agnostic, consumed by human engineers and AI agents alike, and sufficient to establish and maintain multi-Stack parity. No prior session context was applied.

---

## Structural Positives

- **RFC 2119 discipline is consistently applied.** The document uses MUST, SHOULD, and MAY with precision throughout. This is rare in architecture documents and significantly reduces the ambiguity that causes divergent implementations. Every normative statement is correctly graded.

- **The three-problem framing (Fragmentation, Coupling, Drift) is precise and memorable.** Section 1.1 names the problems the architecture solves before stating anything prescriptive. This framing provides the reader with an evaluative lens they can apply to any implementation decision — "does this choice resist fragmentation or introduce it?" That is strong pedagogical design.

- **The layer model is correctly specified with direction of dependency.** Section 2.1 defines dependency direction (downward only), not just layer responsibilities. The implication — that a new framework requires only a new Ability and leaves Layers 1–3 unchanged — is made explicit in Section 2.2. This is the key architectural insight of Screenplay and the document communicates it clearly.

- **The Screenplay component contracts are language-agnostic pseudo-signatures.** Sections 3.1–3.4 use pseudocode that is readable in any language while still being precise enough to constrain implementations. This balances agnosticism with specificity effectively.

- **The Decision Register governance model is self-enforcing.** Section 10.6 creates a closed loop: decisions produce DR entries, DR entries are immutable, and supersession requires forward/back references. The model makes governance decay visible — if a rule exists without a DR entry, it has no standing. This is architecturally sound and actively prevents governance drift.

---

## Structural Negatives

- **The `@util` surface type is used throughout but never formally defined.** Section 5.3 introduces `@util` for "tests that exercise logic without a live subject." Section 6 defines API, UI, and CLI surface contracts. Section 7 provides Ability taxonomy for API, UI, and CLI. Neither section defines a `@util` surface contract or a corresponding Ability. Appendix B references `@util` in the compliance checklist. The most practically common surface type in single-application projects is a specification orphan.

- **Section 4 directory blueprint is internally inconsistent with modern naming conventions.** The blueprint uses `features_shared/` (underscore) in Sections 4, 5, 5.2, 5.3, and 11. Stack name examples use `UPPER_SNAKE_CASE` directory names. These represent pre-adoption conventions. Any project that adopts kebab-case naming (as this project did via DR-016) immediately diverges from the RA's own directory examples without a documented reconciliation path.

- **Section 10.2 mandates Stack-level document names in a style that conflicts with document naming standards.** The RA requires `ARCHITECTURE.md`, `SCREENPLAY_GUIDE.md`, `QA_STRATEGY.md` — uppercase. But Section 10.9 mandates a naming conventions document, and DR-020 adopts kebab-case for all authored documents. The specification is self-undermining: following Section 10.9 correctly produces conventions that contradict Section 10.2 literally.

- **No change governance is defined for the Canonical Feature Store.** Section 5.2 defines a propagation process but not a change approval process. There is no specification for who can modify canonical feature files, what review is required before a change is merged, or what happens when a change breaks a Stack that cannot immediately implement the new scenario. In a multi-team environment this is the highest-frequency governance failure point.

- **Section 9.1 has no error handling or recovery specification.** The orchestration lifecycle steps are happy-path only. There is no MUST requirement covering: what to do when the health-check never returns, how to handle a test suite that crashes mid-execution, or what exit code the orchestration script must emit when a step fails. The omission means implementations will diverge in failure behaviour.

---

## Risks and Issues (Highest to Lowest)

---

### Risk 1 — `@util` surface type is specified nowhere: implementations are undefined

**Severity:** Critical
**Sections affected:** 5.3, 6, 7, 9.1, Appendix B

The `@util` tag is introduced in Section 5.3 and appears in Appendix B's compliance checklist, but Sections 6 (Subject Application Contract) and 7 (Ability Taxonomy) provide no corresponding definitions. There is no `@util` surface contract, no `@util` Ability definition, no orchestration lifecycle for `@util` in Section 9.1, and no minimum Memory key set for `@util`.

For any project — including this one — that uses `@util` as its primary surface type, the absence means:

- Implementors cannot determine whether their Ability is compliant
- There is no canonical Ability name for `@util` (unlike `CallAnApi`, `BrowseTheWeb`, `InvokeExecutable`)
- The Orchestration section provides no lifecycle guidance
- A compliance audit using Appendix B can verify tag usage but not surface conformance

**Refactor:**

Add Section 6.0 before the existing 6.1:

```
### 6.0 @util Surface

A @util surface tests logic in-process without spawning a live Subject Application.
The Subject Application classes are imported directly into the test process.

A @util Subject Application MUST:
- Be importable or instantiable directly in the test process without a server or process spawn
- Expose deterministic, side-effect-free public methods for all behaviours under test
- Not share mutable global state between scenarios
- Create fresh instances per scenario

Canonical Ability: UseSubjectDirectly (or project-specific equivalent)
```

Add a Section 7.0 Ability entry for `@util`:

```
Canonical Ability: UseSubjectDirectly
Responsibility: Instantiates the Subject Application class and holds a reference to it.
Configuration: Accepts the class constructor or factory function.
Memory keys written: SOLVE_RESULT, ALGORITHM_PROGRESS (project-specific)
```

Add a `@util` orchestration lifecycle to Section 9.1:

```
@util Surface:
1. Build subject application (if source is co-located)
2. Verify the target class or module is importable
3. Execute test suite (each scenario instantiates the class independently)
4. Capture exit code and log output
5. Write metrics (Section 9.2)
```

---

### Risk 2 — No CI/CD specification despite mandatory orchestration

**Severity:** High
**Sections affected:** 9.1, 9.2, 11 Phase 6

Section 9.1 defines per-surface lifecycle steps and Section 9.2 mandates metrics output. Section 11 Phase 6 says "add the Stack to the orchestration scripts." None of these sections address CI/CD pipeline integration. There is no specification for:

- Which exit code the orchestration script MUST emit on partial failure
- What CI pipeline gates MUST block a merge (test failure, build failure, parity drift)
- Whether the feature parity report MUST be a required CI gate
- What artifact retention behaviour CI pipelines must implement

In practice, every team wiring CI will make independent decisions, defeating the uniformity the architecture aims to provide.

**Refactor:**

Add Section 9.4 — CI/CD Requirements:

```
### 9.4 CI/CD Pipeline Requirements

A compliant CI/CD pipeline MUST:
- Execute the orchestration script for all active Stacks on every merge request
- Block merge if OverallExitCode is non-zero for any Stack
- Execute the feature parity report as a required gate before merge
- Block merge if any canonical feature file is not present in a Stack's local features/ directory
- Publish metrics artifacts from every pipeline run
- Retain pipeline artifacts for the same minimum period defined in Section 9.3

A pipeline MAY:
- Parallelise Stack execution when Stacks are independent
- Cache build artifacts across runs when the subject application source is unchanged
```

---

### Risk 3 — Memory key parity is manually verified and has no enforcement mechanism

**Severity:** High
**Sections affected:** 3.5, 8.1, 8.4

Section 8.1 mandates that Memory key constants are identical across Stacks. Section 8.4 lists this as a parity verification criterion. But the document provides no mechanism for automated cross-Stack verification. In a multi-Stack project, a Python constant named `SOLVE_RESULT = 'solve_result'` (lowercase value) passes Python linting and all Python tests while being an undetected parity defect.

The current project has implemented a feature parity report script but has no equivalent Memory key parity checker.

**Refactor:**

Add a normative requirement in Section 8.1:

```
A project with more than one Stack MUST have an automated parity check that:
- Reads the memory-keys file from each Stack
- Extracts all constants and their string values
- Reports any constant whose value differs from the canonical parity contract
- Fails with a non-zero exit code if any discrepancy is found
- Is executed as part of the CI/CD pipeline (Section 9.4)
```

Add to Appendix A:

```
| memory-key-check.template.md | Script or CI step that validates Memory key parity |
```

---

### Risk 4 — Canonical Feature Store has no change control governance

**Severity:** High
**Sections affected:** 5.1, 5.2

Section 5.1 establishes the canonical feature store as the single source of truth. Section 5.2 defines the propagation process: update canonical, copy to Stacks, add tags. What is absent:

- Who is authorised to modify `features-shared/`
- What review gate is required before a canonical change is accepted
- What constitutes a "breaking" change to a feature file (a new required scenario vs an editorial change)
- How to handle a scenario that cannot be implemented in one Stack — the RA says "record in backlog and tag @pending" but this allows an indefinite parity gap with no resolution deadline
- Whether a new canonical scenario may be merged before all Stacks implement it

Without change governance, a single contributor can break all Stacks by adding a scenario that none can implement.

**Refactor:**

Add Section 5.5 — Feature Change Governance:

```
### 5.5 Feature Change Governance

A change to features-shared/ is classified as one of:
- Non-breaking: editorial changes that do not alter step text, scenario count, or tags
- Breaking: any addition, removal, or modification to step text or scenario structure

Non-breaking changes MAY be merged without a review gate.
Breaking changes MUST:
1. Be reviewed and approved by at least one Stack owner
2. Confirm that all active Stacks have a corresponding implementation plan (even if @pending)
3. Be accompanied by a decision-register.md entry if the change establishes a new step contract
4. Not remain @pending in any Stack for longer than the documented sprint horizon
```

---

### Risk 5 — Section 4 directory blueprint names diverge from real-world adoption patterns

**Severity:** Medium
**Sections affected:** 4, 5, 5.2, 11

The directory blueprint uses:
- `features_shared/` (underscore) — many projects will use `features-shared/` (hyphen) per ecosystem norms
- `[STACK_NAME]/` — implies UPPER_SNAKE_CASE directory names, but Section 4.3 notes the group directory does not define the canonical name

This creates a situation where a project following DR-016 (kebab-case directory names) diverges from the RA blueprint literally while remaining compliant with its intent. Agents reading the RA will produce non-compliant paths unless explicitly told to override.

**Refactor:**

Revise the directory blueprint comment and introduce a naming note:

```
repository-root/
├── features-shared/         # Canonical Feature Store — directory name follows project convention
│                            # The RA uses features_shared/ as an illustrative placeholder.
│                            # Projects MUST document their chosen name in naming-conventions.md.
├── [stack-dir-name]/        # One directory per Stack. Directory name follows project convention.
│                            # The canonical Stack name (UPPER_SNAKE_CASE) is independent of
│                            # the filesystem directory name (see Section 4.3).
```

Add a normative note to Section 4:

```
The directory names in this blueprint are illustrative. Every project MUST document
its chosen directory naming convention in DOCS/design/naming-conventions.md before
creating any Stack directory. The illustrative names do not supersede the project's
documented naming convention.
```

---

### Risk 6 — Interaction Sequence diagram (Section 3.6) is incomplete and misleading

**Severity:** Medium
**Sections affected:** 3.6

The sequence diagram shows:

```
Task.performAs(actor)
    → actor.abilityTo(Ability).interact(...)
    → actor.remember(MEMORY_KEY, result)
```

This implies `actor.remember()` is called directly inside `Task.performAs()`. In practice, many framework implementations (including Serenity/JS v3.43+) restrict the actor type inside interaction lambdas to `UsesAbilities & AnswersQuestions & CollectsArtifacts`, which does not expose `remember()`. Implementors following the diagram literally will encounter type errors.

The diagram also omits the case where a Task delegates to another Task (Tasks are composable, Section 3.3), leaving the composition pattern unspecified.

**Refactor:**

Revise Section 3.6 to add a note and an extended sequence:

```
Note: Framework implementations may restrict the actor type available inside a
Task's execution context. When actor.remember() is not accessible in a lambda,
use the framework's equivalent Notes/memory API (e.g. notes<T>().set(KEY, value)).
The logical contract — Tasks write Memory, Questions read Memory — remains normative.
The specific API call is an implementation detail governed by the framework.

Extended sequence (Task composition):

Step Definition
  -> actor.attemptsTo(OuterTask)
      -> OuterTask.performAs(actor)
          -> actor.attemptsTo(InnerTask)   // Task may delegate to another Task
              -> InnerTask.performAs(actor)
                  -> actor.abilityTo(Ability).interact(...)
                  -> [memory write via framework API]
```

---

### Risk 7 — Section 10 document names are uppercase where Section 10.9 will make them kebab-case

**Severity:** Medium
**Sections affected:** 10.1, 10.2, Appendix A

Section 10.1 lists `README.md`, `CHANGELOG.md`. Section 10.2 lists `ARCHITECTURE.md`, `SCREENPLAY_GUIDE.md`, `QA_STRATEGY.md`. Appendix A lists template files with mixed-case output names. Meanwhile, Section 10.9 mandates a naming conventions document that will record the project's file naming choices — which may well produce kebab-case names for all of these.

The RA contains both explicit filename mandates (uppercase) and a mechanism (Section 10.9) that allows projects to override them. Any project that adopts kebab-case file naming will be simultaneously compliant with Section 10.9 and technically non-compliant with Section 10.1's literal filename.

**Refactor:**

Revise Section 10.1 table to separate fixed-name from convention-governed files:

```
| Document | Path | Convention | Template |
|----------|------|-----------|----------|
| README.md | repository root | FIXED — ecosystem standard | readme.template.md |
| CHANGELOG.md | repository root | FIXED — CI tooling standard | changelog.template.md |
| backlog.md (or BACKLOG.md) | DOCS/planning/ | Project convention per Section 10.9 | backlog.template.md |
| decision-register.md | repository root | Project convention per Section 10.9 | decision-record.template.md |
```

Add a note:

```
Documents marked FIXED retain their exact names regardless of the project naming convention.
Other document names MUST follow the project's naming-conventions.md and the template's
Produces: field MUST be updated to reflect the chosen name.
```

---

### Risk 8 — No test data management specification

**Severity:** Medium
**Sections affected:** 5, 6, 9

The architecture defines behavioral contracts (Gherkin feature files) and orchestration contracts (lifecycle, metrics) but says nothing about test data. For projects where test data is the primary input to the system under test (e.g., a puzzle solver with `puzzles.json`), there is no guidance on:

- Whether test data lives in the Stack, the canonical feature store, or a shared package
- How test data is versioned alongside feature files
- Data isolation between scenarios (e.g., whether a scenario can modify shared data)
- Data-driven testing patterns beyond parameterised step text

**Refactor:**

Add Section 5.5 (or 5.6 if 5.5 is taken by change governance) — Test Data Management:

```
### 5.6 Test Data Management

Test data is any fixture, seed, or configuration required to execute a Gherkin scenario.
The architecture makes the following provisions:

- Test data MUST NOT be embedded in canonical feature files as inline literals
  (see Section 5.4 on parameterised steps)
- Test data used by a single Stack MUST live in that Stack's directory
- Test data shared across Stacks MUST live in a documented location under packages/
  or in a dedicated data/ directory at the repository root
- Shared test data MUST be versioned and its path MUST be documented in
  DOCS/architecture/subject-app-contract.md
- A scenario MUST NOT modify shared test data — it MUST operate on a copy or an
  in-memory representation

Data-driven scenarios SHOULD use Scenario Outline with Examples tables.
The Examples data belongs in the Stack's local feature copy, not in features-shared/.
```

---

### Risk 9 — Section 9.3 archival requires CHANGELOG.md entry for a retention policy change

**Severity:** Low
**Sections affected:** 9.3

The rule "record the archival event in `CHANGELOG.md` if the retention policy changes" conflates operational configuration change (retention window) with user-visible changelog entries. CHANGELOG.md is intended for release notes and notable changes visible to project consumers. A retention policy change is an operational concern for the build system operator, not a release note.

In practice this rule will either be ignored (the policy changes without a changelog entry, silently), or the changelog will accumulate operational noise that obscures actual feature changes.

**Refactor:**

Replace the CHANGELOG reference with a decision-register reference:

```
The archival process MUST:
- Preserve the metrics summary file even after log files are purged
- Record any change to the retention policy as a decision-register.md entry,
  documenting the new retention window, the reason for the change, and the
  effective date
```

---

### Risk 10 — Parity Verification (Section 8.4) lists criteria but no verification method

**Severity:** Low
**Sections affected:** 8.4

Section 8.4 defines five criteria for parity. Appendix B provides a quick-reference checklist. Neither specifies how the verification is performed — manually, via script, or via CI gate. The current project has a `generate-feature-parity-report.ps1` script for criterion 1 (feature file presence), but criteria 2–4 (Memory key values, step text, component signatures) have no automated verification.

A checklist that is filled in manually is subject to human error and incomplete verification.

**Refactor:**

Add a verification method column to Section 8.4:

```
| Criterion | Verification method |
|-----------|---------------------|
| 1. Canonical scenarios present | Automated parity report (generate-feature-parity-report) |
| 2. Memory keys match | Automated memory-key checker (see Section 8.1 addition) |
| 3. Step text matches | Automated diff of step text against canonical (parity report extension) |
| 4. Component signatures match | Manual review against parity-contract.md; automated in future |
| 5. No unacknowledged gaps | Automated backlog scan for Stack-specific @pending items |
```

Add a normative statement:

```
A Stack MUST NOT be declared in parity based solely on manual checklist completion.
Criteria 1, 2, and 3 MUST be verified by an automated tool before the parity declaration.
```

---

### Risk 11 — The "packages/" directory is underspecified

**Severity:** Low
**Sections affected:** 4

Section 4 shows `packages/` as "Shared code packages (OPTIONAL)" with no further specification. In a multi-Stack project, shared utilities (e.g., a common PuzzleLoader port or a shared assertion helper) will naturally emerge. The architecture provides no guidance on:

- What is and is not appropriate to place in `packages/`
- How shared packages relate to the parity contract
- Whether shared packages count as part of the Stack or the project
- How shared package changes are versioned and propagated

**Refactor:**

Add Section 4.4 — Shared Packages:

```
### 4.4 Shared Packages

A project MAY place code shared between Stacks under `packages/`. When used:

- Each package MUST be independently versioned
- A package MUST NOT contain Stack-specific code or test runner imports
- Shared Screenplay components (e.g., a language-agnostic Actor base class) are
  appropriate candidates for packages/
- Subject application source code MUST NOT live in packages/ unless it is a pure
  utility library with no Stack-specific dependencies
- Any change to a shared package that affects the public interface MUST be
  accompanied by a decision-register.md entry and a parity verification run
  against all dependent Stacks
```

---

## Summary

### Analysis of Overall Design Quality

**Structural strengths:**
- The five-layer model with unidirectional dependencies is architecturally sound and correctly derived from the Ports and Adapters pattern adapted for test automation
- RFC 2119 usage is consistent and precise, making normative vs informative statements unambiguous throughout
- The Decision Register governance model creates a closed, self-documenting loop that resists silent drift
- The Screenplay pattern abstractions (Actor, Ability, Task, Question, Memory) are correctly separated by concern and the responsibilities of each are clearly bounded
- The agnosticism from language, framework, and tool is genuine and well-maintained — no section inadvertently locks the architecture to a specific technology

**Structural weaknesses:**
- The `@util` surface type is a first-class implementation pattern with no corresponding formal definition in Sections 6 or 7
- Directory name examples in Section 4 are illustrative but will produce immediate divergence in any project adopting modern naming conventions
- Section 10 documentation obligations contain both fixed-name requirements (README.md) and convention-governed requirements without distinguishing them
- No CI/CD requirements despite a mandatory orchestration specification — the two sections exist in isolation when they should be integrated
- Test data management is entirely absent, leaving a common source of scenario fragility unaddressed

### Main Points to Highlight

- **The core idea is correct and well-executed.** A single Gherkin contract expressed in the canonical feature store, implemented independently per Stack, with Memory as the cross-cutting state channel — this is the right decomposition for multi-language test automation.
- **The governance apparatus (Decision Register, backlog, templates) is unusually strong.** Most architecture documents describe the implementation without governing the process. This one governs both, which is harder and more valuable.
- **The `@util` gap is the most urgent structural deficiency** for any single-application project. An entire surface type is used, specified in tags, referenced in appendices, and yet missing from the surface contract and Ability taxonomy sections.
- **The document would benefit from a "Conformance Levels" concept** — distinguishing between a minimal compliant implementation (single Stack, `@util`, manual parity) and a fully conformant implementation (multi-Stack, automated CI, full parity checking). As written, the MUST requirements are the same regardless of project scale, which means a single-developer proof-of-concept carries the same documentation burden as a ten-team production project.
- **The interaction between Section 10.9 (naming conventions) and the explicit filenames in Sections 10.1/10.2 is an unresolved tension** that will trip up every project that adopts non-uppercase filename conventions.

### Pedagogical Assessment

The document is a strong pedagogical artifact with specific strengths and one notable gap.

**Strengths:**
- The problem statement (Section 1.1) teaches before it prescribes — a reader who has never seen the Screenplay pattern immediately understands what problems it is solving
- The layer diagram (Section 2.1) communicates the architecture in under ten seconds without requiring prose
- The three-problem framing provides a reusable decision filter — when implementing any component, a developer can ask "does this choice increase or decrease fragmentation/coupling/drift?"
- The pseudocode contracts for Actor, Task, Question, and Ability (Sections 3.1–3.4) teach the pattern abstractly before any language-specific implementation is shown
- Appendix B as a quick-reference checklist is genuinely useful and could be extracted into a CI gate

**Gap:**
- The document teaches the *what* (structure and contracts) but not the *when* (when to create a new Task vs extend an existing one, when a Memory key pattern change requires a Decision Register entry, when a step change is "breaking"). A companion "anti-patterns" or "decision guide" section would complete the pedagogical picture.

---

## Future Work

### Potential Expansions

**Formal `@util` surface specification**
The most immediately useful addition. Add a complete `@util` section to Sections 6 and 7 covering the in-process subject application contract, the `UseSubjectDirectly` Ability canonical form, and the `@util` orchestration lifecycle. This makes the RA complete for single-application projects.

**Conformance levels**
Introduce three conformance tiers: Baseline (single Stack, manual parity, no CI), Standard (CI gated, automated feature parity, multiple Stacks), and Full (automated Memory key parity, automated signature verification, retention-archiving). This allows teams to adopt incrementally rather than meeting the full burden from day one.

**Anti-patterns appendix**
Add Appendix C listing common implementation mistakes and how to recognize them: steps importing Abilities directly (layer violation), Tasks containing assertions (layer violation), inline literal values in canonical feature files (over-specification), Memory keys that differ between Stacks (parity defect). These are the patterns that produce the Fragmentation, Coupling, and Drift problems named in Section 1.1.

**WebSocket and streaming surface type**
Section 6 covers API (REST/HTTP), UI (browser), and CLI (process). A WebSocket or gRPC streaming surface type is increasingly common in modern applications. An `@streaming` or `@realtime` surface contract with its Ability taxonomy would future-proof the architecture.

**Hexagonal test composition pattern**
Section 6.4 mentions mixed surfaces but does not define a composition model for multi-surface tests. A full section on hexagonal test composition — how to design an Actor that interacts with two surfaces in one scenario, how to namespace Memory keys, how to sequence surface interactions — would make this capability practical rather than theoretical.

**Test observability**
No section addresses how test execution is observed beyond metrics and logs. Structured event emission, trace IDs on scenarios, and correlation between test steps and application log entries are increasingly expected in production test suites. An `@observability` or `Section 12` could specify structured event shapes.

---

### Legacy Debt

**`features_shared/` underscore naming throughout the document**
Every reference to the canonical feature store uses underscore notation. Projects adopting hyphen-separated naming (per ecosystem norms and DR-016) accumulate a permanent literal divergence from the RA's own examples. A single search-and-replace pass updating all occurrences to `features-shared/` with a note that projects MAY use a different name per their naming-conventions.md would remove this ongoing confusion.

**Section 10.2 uppercase Stack document names**
`ARCHITECTURE.md`, `SCREENPLAY_GUIDE.md`, `QA_STRATEGY.md` — these uppercase names are hardcoded into the normative requirements. Any project adopting kebab-case (DR-020) immediately has a literal non-compliance with Section 10.2. The resolution is to change these from fixed names to template-governed names, matching the treatment of `backlog.md` (Section 10.1 already shows the kebab form there).

**Appendix A template index lists incorrect `DOCS/templates/` path**
Appendix A says templates MUST exist under `DOCS/templates/`. Projects that adopt the dot-prefix directory convention (DR-001, DR-019) will use `DOCS/.templates/`. The appendix needs a note that the path follows the project's naming-conventions.md, not the literal `DOCS/templates/` value shown.

**Section 10.3 architecture documents are underspecified**
Four documents are mandated (screenplay parity contract, subject application contract, orchestration design, logging design) with only a one-line purpose statement each. The parity contract is critical — its required content should be defined in the RA itself (minimum required sections) rather than deferred entirely to a template that the RA only references by filename.

**Section 9.3 CHANGELOG.md for retention policy changes**
As noted in Risk 9 above, this requirement conflates operational state with release notes. The legacy fix is to replace it with a decision-register.md reference and update any existing implementations that are writing retention policy changes to CHANGELOG.md.

---

*This review is read-only once written per project policy (DR-012, Section 10.7). Action items raised here MUST be tracked in `DOCS/.planning/backlog.md` or `decision-register.md` as appropriate; they MUST NOT remain only inside this review file.*
