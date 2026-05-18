# Screenplay-BDD Test Automation — Agnostic Reference Architecture

**Version:** 1.7
**Status:** Accepted
**Date:** 2026-05-18
**Applies to:** Any project adopting the Screenplay-BDD structure described herein

---

## Preamble

### Terminology (RFC 2119)

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).

### Definitions

| Term | Definition |
|---|---|
| **Stack** | One complete, self-contained test implementation: a subject application instance paired with its test framework, Screenplay components, and step definitions |
| **Subject Application** | The software being tested. May be an API service, a user interface, a command-line executable, or a combination |
| **Surface Type** | The interaction boundary through which a Stack communicates with its Subject Application. One of: `API`, `UI`, or `CLI` |
| **Canonical Feature Store** | The single authoritative source of Gherkin feature files from which all Stacks consume |
| **Parity** | The state in which all Stacks express the same behavioral contract, differing only in the language and tooling used to implement it |
| **Screenplay** | The design pattern at the centre of this architecture. See Section 3 |
| **Ability** | A Screenplay component that grants an Actor the capacity to interact with a specific Surface Type |
| **Task** | A Screenplay component that describes a meaningful unit of work an Actor performs |
| **Question** | A Screenplay component that retrieves observable state from the Subject Application |
| **Memory** | A Screenplay component that holds state shared between Tasks and Questions within a single test scenario |
| **Agent** | Any automated process — AI or otherwise — that reads this document and acts on its instructions |

---

## 1. Purpose and Philosophy

### 1.1 Problem Statement

Test automation suites degrade in three predictable ways:

1. **Fragmentation** — each team or language community writes tests differently, making cross-stack comparison impossible
2. **Coupling** — test logic is tightly bound to a specific tool, making migration expensive and risky
3. **Drift** — stacks fall out of parity silently; one stack passes what another would fail

This architecture addresses all three through a single structural constraint: **behavioral intent is expressed once, in plain language, and implemented everywhere.**

### 1.2 Core Principle

A single behavioral contract — written as Gherkin feature files — is the source of truth for all Stacks. Every Stack implements that contract in its own language and tooling. Any Stack that cannot execute the canonical feature files is out of compliance.

### 1.3 What This Architecture Is Not

- It is not tied to any specific programming language
- It is not tied to any specific test framework or test runner
- It is not tied to any specific type of Subject Application
- It is not a tutorial on any particular tool
- It is not prescriptive about folder naming beyond the structural roles described in Section 4

### 1.4 Intended Consumers

This document is written to be read and acted upon by:
- Human engineers onboarding a new Stack or project
- AI coding agents setting up or auditing a project
- Architects evaluating whether a project conforms to this structure

---

## 2. Core Architectural Concepts

### 2.1 The Layer Model

Every Stack in this architecture is composed of five layers. Each layer has a single responsibility and communicates only with the layers immediately above and below it.

```
┌─────────────────────────────────────────────────────┐
│  LAYER 1 — Feature Files (Gherkin)                  │
│  Plain-language behavioral specifications.          │
│  Owned by the Canonical Feature Store.              │
│  No code. No tool references.                       │
├─────────────────────────────────────────────────────┤
│  LAYER 2 — Step Definitions                         │
│  Maps Gherkin steps to Screenplay interactions.     │
│  Language-specific. Thin — no business logic here.  │
├─────────────────────────────────────────────────────┤
│  LAYER 3 — Screenplay (Actor, Tasks, Questions)     │
│  Expresses what the Actor does and observes.        │
│  Business logic lives here. Framework-independent.  │
├─────────────────────────────────────────────────────┤
│  LAYER 4 — Abilities                                │
│  Wraps the specific tool used to interact with the  │
│  Subject Application. Isolates framework coupling.  │
├─────────────────────────────────────────────────────┤
│  LAYER 5 — Subject Application                      │
│  The software under test: API, UI, or CLI.          │
│  Lives outside the test suite. Defined by contract. │
└─────────────────────────────────────────────────────┘
```

### 2.2 Direction of Dependency

Dependencies flow **downward only**. Feature files know nothing about Steps. Steps know nothing about Abilities. Abilities know nothing about Tasks. The Subject Application knows nothing about any of them.

This constraint is what makes each layer substitutable. A new test framework requires only a new Ability; the Tasks and Questions above it are unchanged.

### 2.3 The Role of the Screenplay Layer

The Screenplay layer (Layer 3) is the portability guarantee. It is the layer that can be read by a human or an Agent and understood without knowledge of the underlying tool. It answers the question: *what does this test intend to do?*

If Layers 1–3 are consistent across all Stacks, parity is structurally enforced regardless of what lives in Layers 4 and 5.

---

## 3. Screenplay Pattern (Agnostic)

The Screenplay pattern models a test as a **performance**: Actors are given Abilities, attempt Tasks, and answer Questions. State is held in Memory between steps.

### 3.1 Actor

An Actor is the central entity in a test scenario. It represents a persona — a user, a consumer, a calling system — that interacts with the Subject Application.

**Responsibilities:**
- Hold a set of Abilities
- Execute a sequence of Tasks
- Answer Questions by querying state from Memory or the Subject Application
- Maintain a Memory store scoped to the current scenario

**Contract:**
```
Actor
  named(label)            → creates a new Actor with the given label
  whoCan(ability, ...)    → attaches one or more Abilities to the Actor
  attemptsTo(task, ...)   → executes one or more Tasks in sequence
  answer(question)        → evaluates a Question and returns its result
  remember(key, value)    → stores a value in Memory under the given key
  recall(key)             → retrieves a value from Memory by key
  forget()                → clears all Memory (called after each scenario)
```

An Actor MUST be created fresh per scenario. Memory MUST be cleared between scenarios.

### 3.2 Ability

An Ability grants an Actor the capacity to interact with a specific Surface Type. It wraps the tool or library used to perform that interaction, isolating the Screenplay layer from framework-specific code.

**Responsibilities:**
- Encapsulate the tool or client used to interact with the Subject Application
- Expose a minimal, stable interface that Tasks can call
- Store interaction results into the Actor's Memory

**Contract:**
```
Ability
  [static] using(config)  → creates a configured instance of the Ability
  [accessed via Actor]     → retrieved by type: actor.abilityTo(AbilityType)
```

An Ability MUST NOT contain assertion logic. Assertions belong in Questions.

### 3.3 Task

A Task describes a meaningful unit of work that an Actor performs. Tasks are composable — a Task may call other Tasks.

**Responsibilities:**
- Describe *what* the Actor is doing in business terms
- Delegate the mechanics of interaction to the appropriate Ability
- Store outcomes in the Actor's Memory for later retrieval by Questions

**Contract:**
```
Task
  [static] named(...)     → factory method, returns a configured Task instance
  performAs(actor)        → executes the Task using the Actor's Abilities and Memory
```

A Task MUST NOT contain assertion logic. A Task MUST NOT directly access the Subject Application except through an Ability.

### 3.4 Question

A Question retrieves observable state — from Memory, or by performing a read-only interaction with the Subject Application — and returns it for assertion.

**Responsibilities:**
- Read state from Actor Memory or from the Subject Application
- Return a typed value suitable for assertion
- Remain side-effect free

**Contract:**
```
Question
  [static] about(...)     → factory method, returns a configured Question instance
  answeredBy(actor)       → evaluates the Question using the Actor's state and returns a value
```

A Question MUST be side-effect free. It MUST NOT modify state or Memory.

### 3.5 Memory

Memory is a key-value store scoped to a single scenario. It provides the shared state channel between Tasks (which write) and Questions (which read).

**Rules:**
- Memory keys MUST be defined as named constants, not inline string literals
- Memory key constant names and their string values MUST be identical across all Stacks (see Section 8.1)
- Memory MUST be cleared at the end of every scenario
- A Stack MUST NOT share Memory state between scenarios

### 3.6 Interaction Sequence

The following sequence describes a complete Screenplay interaction from step to assertion:

```
Step Definition
  → calls actor.attemptsTo(Task)
      → Task.performAs(actor)
          → actor.abilityTo(Ability).interact(...)
          → actor.remember(MEMORY_KEY, result)
  → calls actor.answer(Question)
      → Question.answeredBy(actor)
          → actor.recall(MEMORY_KEY)
          → returns value
  → assertion on returned value
```

---

## 4. Directory Structure Blueprint

The following structure is the REQUIRED layout for any repository adopting this architecture. Names in `UPPER_CASE` are fixed roles; names in `lower_case_italic` are illustrative and MAY vary by project.

```
repository-root/
│
├── features_shared/                  # Canonical Feature Store (Section 5)
│   ├── [surface-category]/           # e.g. api/, ui/, cli/
│   │   └── [feature-group]/          # Groups related features
│   │       └── *.feature             # Gherkin feature files
│   └── util-tests/                   # Tests that exercise logic without a live subject
│       └── [feature-group]/
│           └── *.feature
│
├── [STACK_NAME]/                     # One directory per Stack (repeated per Stack)
│   ├── [subject-app-src]/            # Subject application source (if co-located)
│   ├── [test-src]/                   # Test source: features, steps, screenplay
│   │   ├── features/                 # Local copy of canonical features + stack tags
│   │   ├── step_definitions/         # Step definitions (language-specific, thin)
│   │   └── screenplay/               # Screenplay components
│   │       ├── abilities/
│   │       ├── actors/
│   │       ├── tasks/
│   │       ├── questions/
│   │       └── support/              # Memory keys, world/context setup
│   ├── tooling/                      # Test runner config, reporters, helpers
│   ├── docs/                         # Stack-level documentation (Section 10.2)
│   └── [build/config files]          # Language-specific config: package, project, toml, etc.
│
├── packages/                         # Shared code packages (OPTIONAL)
│   └── [shared-package]/             # Code shared between Stacks (e.g. shared utilities)
│
├── .batch/ OR scripts/               # Orchestration scripts (Section 9)
│   └── [runners, builders, helpers]
│
├── DOCS/                             # Project-wide documentation (Section 10)
│   ├── algorithm/                    # Algorithm specifications (one file per algorithm)
│   ├── architecture/                 # Cross-cutting architectural specifications
│   ├── design/                       # Design standards and conventions
│   │   └── naming-conventions.md     # REQUIRED (Section 10.9)
│   ├── planning/                     # Backlog, roadmap, work tracking
│   │   └── BACKLOG.md                # REQUIRED (Section 10.1)
│   ├── implementation-logs/          # Development session logs (Section 10.8)
│   └── templates/                    # MANDATORY document templates (Section 10.5)
│
├── code-review/ OR .review/          # Code review outputs (Section 10.7)
│
├── .results/                         # Test execution output (gitignored or archived)
│   └── .metrics/                     # Structured metrics files (Section 9.2)
│
├── [ci-cd-dir]/                      # CI/CD pipeline definitions (e.g. .github/, .gitlab/)
│
├── README.md                         # REQUIRED (Section 10.1)
├── CHANGELOG.md                      # REQUIRED (Section 10.1)
├── decision-register.md              # REQUIRED (Section 10.6)
└── [ai-agent-instruction-file]       # REQUIRED (Section 10.4)
```

### 4.1 What MUST NOT Live in features_shared/

- Step definitions
- Screenplay components
- Any language-specific code
- Any tool configuration

The Canonical Feature Store contains only `.feature` files and MUST be readable by a non-technical stakeholder.

### 4.2 What MUST NOT Live in screenplay/

- Assertion libraries or assertion calls
- Test runner setup or teardown hooks
- Subject application source code
- Any import of a framework-specific test runner

### 4.3 Optional Stack Group Directory

A project MAY place Stack directories under one project-specific Stack group directory when the grouping is documented in `DOCS/design/naming-conventions.md`. The group directory does not change the canonical Stack name. For example, `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/` still has the Stack name `DEMOAPP001_TYPESCRIPT_CYPRESS`.

---

## 5. The Canonical Feature Store

### 5.1 Single Source of Truth Rule

All Gherkin feature files originate in `features_shared/`. This directory is the **only** authoritative source of behavioral specifications.

A Stack MUST NOT author its own feature files independently. A Stack's local `features/` directory is a copy of the canonical files, extended only with Stack-specific or lifecycle tags.

### 5.2 Feature Distribution

When a feature file in `features_shared/` is created or updated, the change MUST be propagated to all Stacks before the work is considered complete. The propagation process is:

1. Update or create the feature file in `features_shared/` with the required canonical scope tag
2. Copy the updated file to the corresponding path in each Stack's `features/` directory
3. Add Stack-specific or lifecycle tags to the local copy only
4. Update `DOCS/planning/backlog.md` if any Stack cannot yet implement the new scenario (see Section 10.1)
5. Record the decision in `decision-register.md` if the change represents a structural choice (see Section 10.6)

### 5.3 Tag Taxonomy

Tags in feature files serve three purposes: scope filtering (run a subset of tests), lifecycle control (start/stop the subject application), and stack applicability.

**Reserved tag categories:**

| Tag Category | Purpose | Example |
|---|---|---|
| Surface tag | Identifies which surface type the scenario exercises | `@api`, `@ui`, `@cli` |
| Lifecycle tag | Signals that the subject application must be running | `@requires-app` |
| Utility tag | Marks tests that exercise logic without a live subject | `@util` |
| Stack tag | Marks scenarios that apply only to a specific Stack | `@stack-demoapp001` |

Canonical feature files MUST contain exactly one canonical scope tag:
- Surface features under `features_shared/api/`, `features_shared/ui/`, or `features_shared/cli/` MUST use the matching surface tag (`@api`, `@ui`, or `@cli`)
- Utility features under `features_shared/util-tests/` MUST use `@util`

Lifecycle tags (`@requires-app`) and Stack tags are Stack-local additions unless a Decision Register entry explicitly authorises a canonical exception. Stack tags MUST use the lowercase short Stack identifier format `@stack-demoappNNN` (for example, `@stack-demoapp001`).

### 5.4 Step Definition Shape

Step definitions MUST use generic, parameterised steps wherever possible. The goal is maximum reuse across scenarios and Stacks.

**Preferred pattern:**
```gherkin
When a request is made to "{endpoint}"
Then the response status should be {status_code}
And the response field "{field}" should equal "{expected_value}"
```

**Avoided pattern (over-specified):**
```gherkin
When the user submits a POST request to the token parser date endpoint with header X-Correlation-Id
```

Over-specified steps cannot be reused. Any step that names a specific endpoint, field, or value inline SHOULD be refactored to accept those values as parameters.

### 5.5 Feature Change Governance

Changes to canonical feature files carry different risks depending on whether they are breaking or non-breaking. This section defines how each class of change MUST be treated.

**Change classification:**

| Change type | Breaking? | Definition |
|-------------|-----------|------------|
| Add a new scenario to an existing feature file | Breaking | All Stacks must implement the new step(s) or mark the scenario `@pending` |
| Add a new feature file | Breaking | All Stacks must copy the file and implement step definitions |
| Modify step text in an existing scenario | Breaking | Step definition in every Stack will no longer match; the Stack breaks immediately |
| Remove a scenario | Breaking | Stack-local feature copy and step definitions must be updated in all Stacks simultaneously |
| Change only the canonical scope tag | Non-breaking | Tag line is Stack-local; canonical scope tag changes propagate via the copy process |
| Change scenario description (not step text) | Non-breaking | Descriptive text does not affect step matching |
| Fix whitespace or blank lines | Non-breaking | No effect on step matching or scenario count |

**Breaking change gate (MUST):**

When a breaking change to a canonical feature file is proposed, the following MUST occur before the change is merged:

1. All Stacks with an active implementation MUST have their step definitions updated or the affected scenarios tagged `@pending` locally.
2. A `decision-register.md` entry MUST be created if the change represents a structural decision (e.g. removing a scenario permanently, renaming a step category).
3. A `DOCS/planning/backlog.md` item MUST be created for every Stack that cannot implement the change immediately, with status `Open`.
4. The parity report (`.batch/generate-feature-parity-report.ps1`) MUST pass before the change is merged.

**`@pending` resolution deadline:**

A scenario tagged `@pending` in a Stack-local feature copy represents a known parity gap. This gap MUST be resolved within the next scheduled sprint. If the gap is not resolved within one sprint boundary, the backlog item status MUST be escalated to a blocker and the gap MUST be explicitly acknowledged in the relevant Decision Register entry.

A `@pending` scenario that persists beyond two consecutive sprint boundaries without a Decision Register entry is a defect in the governance process, not an accepted state.

**Canonical feature files MUST NOT be changed:**

- To add Stack-specific implementation details
- To remove a scenario because one Stack cannot implement it
- By a developer working on a Stack-local implementation — all canonical changes flow from the canonical feature file outward

---

## 6. Subject Application Contract

The Subject Application is the software under test. This architecture supports four Surface Types. A project MAY implement one or more surface types across its Stacks.

### 6.0 @util Surface (In-Process Logic Testing)

A `@util` surface tests application logic in-process, without spawning or connecting to a live subject application process. The test runner imports or instantiates the Subject Application classes directly within the same process as the test suite.

This is the appropriate surface type for testing pure-logic components such as solvers, calculators, parsers, and transformers — where no HTTP server, browser, or subprocess is required to exercise the code under test.

A Subject Application suitable for `@util` testing MUST:

- Be importable or instantiable directly in the test process without a server, browser, or subprocess spawn
- Expose deterministic, side-effect-free public methods for all behaviours under test
- Not share mutable global state between test scenarios
- Support fresh instance creation per scenario (or provide a documented reset mechanism)
- Produce the same output for the same input, regardless of execution order or concurrency

A `@util` surface MUST NOT:

- Require a running network service, database, or file system to initialise
- Produce non-deterministic output for a given set of inputs
- Maintain shared state across scenario boundaries

### 6.1 API Surface

A Subject Application with an API surface MUST:

- Expose at least one health-check endpoint that returns a predictable, unambiguous alive signal
- Return structured, machine-readable responses (e.g. JSON, XML) for all endpoints under test
- Return a meaningful status code for both success and failure conditions
- Accept and propagate a correlation identifier on requests, which appears in logs and responses
- Expose a discoverable contract (e.g. OpenAPI/Swagger, WSDL, or equivalent) for each endpoint under test

### 6.2 UI Surface

A Subject Application with a UI surface MUST:

- Be accessible at a stable, configurable entry point (URL, file path, or launch command)
- Expose observable state through the DOM, accessibility tree, or equivalent queryable structure
- Present interactive controls (forms, buttons, navigation) that can be driven without mouse coordinates
- Reach a deterministic ready state that a test can detect before interaction begins
- Return to a clean state (login page, home screen, reset form) between scenarios, or provide a mechanism for the test to force a reset

### 6.3 CLI Surface

A Subject Application with a CLI surface MUST:

- Be invokable as a single command with a documented argument and option interface
- Return a meaningful exit code: `0` for success, non-zero for failure
- Write human-readable output to stdout and error detail to stderr
- Produce deterministic output for a given set of inputs
- Complete within a documented time bound, or surface a timeout mechanism

### 6.4 Mixed Surfaces

A Stack MAY test a Subject Application across more than one surface type (e.g. trigger an action via CLI and verify the result via API). In this case:

- Each surface MUST have its own Ability (see Section 7.4)
- Tags MUST reflect all surfaces exercised by a scenario (e.g. `@cli @api`)
- Memory serves as the shared channel between surface interactions within a single scenario

---

## 7. Ability Taxonomy by Surface Type

This section defines the canonical Ability roles for each surface type. Naming conventions are illustrative; the structural contract is normative.

### 7.0 @util Surface Ability

**Canonical Ability: `UseSubjectDirectly`**

Wraps the Subject Application class or module used in in-process testing. This Ability holds a reference to the live instance and exposes its public interface to Tasks.

| Responsibility | Description |
|---|---|
| Configuration | Accepts the class constructor, factory function, or module reference at construction |
| Instantiation | Creates a fresh Subject Application instance per scenario (or resets existing state) |
| Invocation | Calls the Subject Application's public methods on behalf of Tasks |
| Output capture | Stores return values, status strings, and thrown errors in Actor Memory |

The Ability MUST NOT contain assertion logic. Assertions belong in Questions.

The Ability MUST NOT persist state between scenarios. Each scenario MUST interact with a freshly instantiated or reset Subject Application.

**Note on naming:** The canonical name `UseSubjectDirectly` is illustrative. Projects SHOULD name the Ability to reflect what is being used (e.g. `UseSudokuSolver`, `UseInvoiceCalculator`). The structural contract — holding an instance, delegating invocation to Tasks, storing results in Memory — is normative regardless of naming.

### 7.1 API Surface Abilities

**Canonical Ability: `CallAnApi`**

Wraps the HTTP client used to make requests to the Subject Application.

| Responsibility | Description |
|---|---|
| Configuration | Accepts a base URL and any default headers at construction |
| Request execution | Sends HTTP requests (GET, POST, PUT, DELETE, PATCH) |
| Response capture | Stores the full response object in Actor Memory under `LAST_RESPONSE` |
| Error surfacing | Surfaces HTTP errors as inspectable response objects, not exceptions |

The Ability MUST NOT parse or assert on the response. That is the responsibility of Questions.

### 7.2 UI Surface Abilities

**Canonical Ability: `BrowseTheWeb`**

Wraps the browser driver or UI automation client used to interact with the Subject Application.

| Responsibility | Description |
|---|---|
| Configuration | Accepts a base URL or launch target at construction |
| Navigation | Navigates to pages, routes, or screens |
| Interaction | Clicks, types, selects, and submits controls |
| State capture | Stores page state, element text, or screenshots in Actor Memory |
| Readiness detection | Waits for the application to reach an interactable state before each action |

**Canonical Ability: `InteractWithComponent`** (for component-level testing)

Wraps a component harness or isolated render environment.

| Responsibility | Description |
|---|---|
| Configuration | Accepts component identifier and initial props/state |
| Interaction | Triggers events on the component |
| State capture | Stores rendered output or emitted events in Actor Memory |

### 7.3 CLI Surface Abilities

**Canonical Ability: `InvokeExecutable`**

Wraps the process execution mechanism used to run the Subject Application as a command.

| Responsibility | Description |
|---|---|
| Configuration | Accepts the executable path, default arguments, and working directory |
| Invocation | Executes the command with a given set of arguments |
| Output capture | Stores stdout, stderr, and exit code in Actor Memory |
| Timeout enforcement | Enforces a maximum execution time and stores a timeout signal if breached |

### 7.4 Composition Rules for Mixed Surfaces

When a scenario exercises more than one surface type:

- Each surface MUST be represented by its own Ability instance attached to the Actor
- Tasks MUST call only the Ability appropriate to their surface
- Memory keys MUST be namespaced by surface to avoid collision (e.g. `API_LAST_RESPONSE`, `CLI_LAST_EXIT_CODE`)
- The order of surface interactions within a scenario MUST be deterministic and documented in the Task sequence

---

## 8. Multi-Stack Parity Rules

Parity is the state in which all Stacks express the same behavioral contract. The following rules are non-negotiable. A Stack that violates any of them is out of parity regardless of whether its tests pass.

### 8.1 Memory Key Parity

Memory key constants MUST use identical string values across all Stacks. The constant name and the string value it holds MUST be the same string.

**Rule:**
```
CONSTANT_NAME  =  "CONSTANT_NAME"
```

A Memory key that uses a different string in one Stack than in another is a parity defect, not a stylistic variation. This matters because Keys appear in logs, debug output, and cross-stack documentation — inconsistency breaks traceability.

**Required Memory keys for @util surface (minimum set):**

| Key | Holds |
|---|---|
| `SOLVE_RESULT` | The primary return value or status string from the most recent Subject Application call |
| `ALGORITHM_PROGRESS` | Boolean — whether the most recent operation produced any observable state change |

**Required Memory keys for API surface (minimum set):**

| Key | Holds |
|---|---|
| `LAST_RESPONSE` | The full response object from the most recent request |
| `LAST_REQUEST_ENDPOINT` | The endpoint path used in the most recent request |

Additional keys for all surface types and project-specific state MUST follow the same naming convention and MUST be listed in the Stack's `screenplay/support/memory-keys` file.

**Automated enforcement:**

In a project with two or more Stacks, manual inspection is insufficient to guarantee Memory key parity at scale. The following rules apply:

- A single-Stack project MAY enforce Memory key parity through manual checklist (Appendix B) at each PR review.
- A multi-Stack project (two or more active Stacks) MUST provide an automated Memory key parity checker. The checker MUST:
  - Parse each Stack's `screenplay/support/memory-keys` file
  - Verify that every constant name equals its string value exactly
  - Verify that the set of constant names is identical across all Stacks
  - Exit non-zero if any mismatch is found
- The checker MUST be run as a CI gate, as specified in Section 9.4.
- A template for the checker is provided in Appendix A (`memory-key-check.template.md`).

This project currently has one active Stack (DEMOAPP001). The automated checker exists as `.batch/check-memory-key-parity.ps1` and runs against DEMOAPP001 as the canonical baseline. When a second Stack is added, the script MUST be extended to compare that Stack's memory-keys file against the DEMOAPP001 baseline.

### 8.2 Step Definition Shape

Step definitions MUST be parameterised (see Section 5.4). The Gherkin text of each step MUST be identical across all Stacks. Only the implementation body differs.

A Stack MUST NOT add or remove Gherkin steps relative to the canonical feature files. If a step cannot be implemented in a Stack's language or framework, that gap MUST be recorded in `DOCS/planning/backlog.md` and the scenario tagged `@pending` locally.

### 8.3 Screenplay Component Signatures

The public interface of each Screenplay component MUST be consistent across Stacks. Language syntax will differ; the logical signature MUST not.

For each component, the parity contract document (see Section 10.3) MUST specify:
- The factory method name and parameter list
- The execution method name (e.g. `performAs`, `answeredBy`)
- The Memory keys written or read by the component
- The Ability type required (for Tasks)

Any change to a component's signature MUST be applied to all Stacks simultaneously and recorded in `decision-register.md`.

### 8.4 Parity Verification

A Stack is considered in parity when:

1. All scenarios in the canonical feature files are present in the Stack's local `features/` directory
2. All Memory key constants match the canonical values exactly
3. All step definition Gherkin text matches the canonical text exactly
4. All Screenplay component signatures match the parity contract document
5. No item in `DOCS/planning/backlog.md` is marked as an unacknowledged parity gap for this Stack

---

## 9. Orchestration and Automation

### 9.1 Subject Application Lifecycle

For each run, the orchestration layer is responsible for managing the full lifecycle of the Subject Application. The lifecycle differs by surface type.

**@util Surface:**

```
1. Build subject application (if source is co-located)
2. Verify the target class or module is importable in the test process
3. Execute test suite (each scenario instantiates the class independently)
4. Capture exit code and log output
5. Write metrics (Section 9.2)
```

**API Surface:**

```
1. Build subject application (if source is co-located)
2. Start subject application process on a known port
3. Wait for health-check endpoint to return the alive signal (warm-up)
4. Execute test suite
5. Capture exit code and log output
6. Stop subject application process
7. Write metrics (Section 9.2)
```

**UI Surface:**

```
1. Build subject application (if source is co-located)
2. Start subject application (server process or static serve)
3. Wait for entry-point URL to return HTTP 200 (warm-up)
4. Launch browser/driver in headless or headed mode
5. Execute test suite
6. Capture exit code, screenshots, and log output
7. Tear down browser/driver
8. Stop subject application process
9. Write metrics (Section 9.2)
```

**CLI Surface:**

```
1. Build subject application (if source is co-located)
2. Verify executable is present at configured path
3. Execute test suite (each scenario invokes the executable independently)
4. Capture exit codes, stdout, and stderr per invocation
5. Write metrics (Section 9.2)
```

### 9.2 Metrics Collection

Every test run MUST produce a metrics artifact. The metrics artifact MUST be written in at minimum two formats:

**Format 1 — Key-value pairs (machine-readable):**
```
[STACK_NAME]_[SUITE]_ExitCode=[0|non-zero]
[STACK_NAME]_[SUITE]_Tests=[count]
[STACK_NAME]_[SUITE]_Passed=[count]
[STACK_NAME]_[SUITE]_Failed=[count]
[STACK_NAME]_[SUITE]_Skipped=[count]
[STACK_NAME]_[SUITE]_Duration=[seconds]
[STACK_NAME]_[SUITE]_Log=[path-to-log-file]
OverallExitCode=[0|non-zero]
```

**Format 2 — Summary table (human-readable markdown):**
```
| Stack | Suite | Exit | Tests | Passed | Failed | Skipped | Duration |
|-------|-------|------|-------|--------|--------|---------|----------|
| ...   | ...   | ...  | ...   | ...    | ...    | ...     | ...      |
```

Metrics files MUST be named with a UTC timestamp suffix to prevent overwriting. Metrics files MUST be written to `.results/.metrics/`.

Feature parity validation reports are generated validation artifacts. When produced, they MUST be written to `.results/feature-parity/` and named `FEATURE_PARITY_[YYYYMMDDTHHMMZ].md`.

### 9.3 Results Archival

Test result logs and metrics MUST be retained for a documented minimum period. The default retention policy is seven calendar days. Results older than the retention period MAY be deleted by an automated archival process.

The archival process MUST:
- Preserve the metrics summary file even after log files are purged
- Record the archival event in `CHANGELOG.md` if the retention policy changes

### 9.4 CI/CD Pipeline Requirements

Every CI/CD pipeline that exercises a Stack MUST enforce the following gates in order. A gate failure MUST halt the pipeline and MUST NOT permit a merge to the default branch.

**Required gates (in order):**

| Gate | Command | Pass condition |
|------|---------|----------------|
| 1. Build | Stack-specific build command (e.g. `npm run build`) | Exit code `0` |
| 2. Lint / Format | Stack-specific lint command (if present) | Exit code `0` |
| 3. Test suite | Stack orchestration script (e.g. `run-demoapp001.ps1`) | `OverallExitCode=0` |
| 4. Feature parity report | `.batch/generate-feature-parity-report.ps1` | `Overall result: PASS` |

**`OverallExitCode` contract:**

- Any Stack orchestration script MUST surface a single `OverallExitCode` variable.
- `OverallExitCode=0` means all gates within the script passed.
- `OverallExitCode` non-zero MUST cause the pipeline step to exit non-zero.
- CI systems MUST treat a non-zero exit from the orchestration script as a blocking failure.

**Feature parity gate:**

The feature parity report (Section 5.4) is a REQUIRED CI gate, not an optional report. The CI pipeline MUST fail if `Overall result: DRIFT` or `Overall result: MISSING` appears in the report output.

**Artifact retention in CI:**

- Test logs and metrics produced by a CI run MUST be retained for the same minimum period defined in Section 9.3 (seven calendar days by default).
- CI artifact storage (e.g. GitHub Actions artifact upload) satisfies the retention requirement; local file storage is not required in CI context.
- Metrics files MUST be published as pipeline artifacts so they are accessible after the pipeline completes.

**Multi-Stack pipelines:**

When multiple Stacks are present, each Stack MUST have an independent pipeline job or step. A failure in one Stack's job MUST NOT suppress reporting of failures in another Stack's job. All Stack jobs MUST complete before a merge is permitted.

---

## 10. Documentation Obligations

All documentation in this architecture is governed by two rules: **every document type has a mandatory template**, and **no document may be created in free-form prose where a template exists**.

### 10.1 Repository-Level Documents

The following documents MUST exist at the paths shown. Each is governed by its named template.

| Document | Path | Template | Purpose |
|---|---|---|---|
| `README.md` | repository root | `templates/readme.template.md` | Project purpose, prerequisites, quick-start per Stack, links to all other docs |
| `CHANGELOG.md` | repository root | `templates/changelog.template.md` | Version history, notable changes, known issues |
| `DOCS/planning/backlog.md` | `DOCS/planning/` | `templates/backlog.template.md` | Outstanding and future work required to keep all Stacks in parity. Each item MUST identify: affected Stack(s), nature of the gap, and priority |
| `decision-register.md` | repository root | `templates/decision-record.template.md` | Structural and process decisions (see Section 10.6) |

**`DOCS/planning/backlog.md` — additional rules:**

- If a gap between Stacks exists and is not listed in `DOCS/planning/backlog.md`, it is a defect, not a decision
- Backlog items that resolve into a structural choice MUST produce a `decision-register.md` entry before the work is closed
- Items MUST carry one of three statuses: `Open`, `In Progress`, `Resolved`
- `Resolved` items MUST NOT be deleted — they MUST be retained as a record that the gap existed

### 10.2 Stack-Level Documents

Each Stack MUST carry the following documents in its `docs/` directory. Each is governed by its named template.

| Document | Template | Purpose |
|---|---|---|
| `ARCHITECTURE.md` | `templates/stack-architecture.template.md` | Design decisions, dependency graph, known constraints specific to this Stack |
| `SCREENPLAY_GUIDE.md` | `templates/screenplay-guide.template.md` | How the Screenplay pattern is implemented in this Stack's language and tooling |
| `QA_STRATEGY.md` | `templates/qa-strategy.template.md` | What is tested, why, and what is explicitly out of scope |
| `README.md` | `templates/stack-readme.template.md` | Stack-specific setup, build, and run instructions |

### 10.3 Architecture Documents

The following cross-cutting specification documents MUST exist under `DOCS/architecture/`. Each is governed by its named template.

| Document | Purpose |
|---|---|
| Screenplay parity contract | Exact component signatures, Memory key literals, and step shapes for all Stacks |
| Subject application contract | Endpoint/UI/CLI surface specification per Stack |
| Orchestration design | How Stacks are started, sequenced, warmed up, and torn down |
| Logging design | Structured event names, log levels, and correlation strategy |

### 10.4 AI Agent Instruction File

A single instruction file MUST exist at the repository root or in the CI/CD configuration directory (e.g. `.github/copilot-instructions.md`, `.claude/instructions.md`, or equivalent). This file gives any AI coding agent sufficient context to work in the repository without breaking parity.

The file MUST include:

- Stack inventory: name, language, framework, surface type, port/entry point
- Canonical feature update procedure (step by step)
- Parity rules summary (Memory keys, step shape, component signatures)
- Risk register: known fragile areas and what to check before changing them
- Reference to `decision-register.md` as authoritative for any rule restated in this file

### 10.5 Template Mandate

Every document category defined in Sections 10.1 through 10.9 MUST have a corresponding template file stored under `DOCS/templates/`.

**Template requirements:**
- MUST define all required headings
- MUST mark mandatory fields with a `[REQUIRED]` annotation
- MUST include placeholder guidance (not filler text) for each section
- MUST specify the document's intended audience at the top

An Agent or developer creating any document without a corresponding template first is out of compliance with this architecture. If a document type is needed and no template exists, creating the template MUST precede creating the document.

### 10.6 Decision Register

`decision-register.md` tracks every structural and process decision that shapes the project. Decisions are **durable**: once recorded, an entry is valid provenance for any downstream claim, implementation choice, or parity rule. If a decision is not in the register, it has no authoritative standing.

**Each entry MUST be authored from `templates/decision-record.template.md` and MUST contain exactly these five fields:**

| Field | Purpose |
|---|---|
| **Context** | The situation or constraint that made a decision necessary |
| **Decision** | The choice that was made, stated plainly and unambiguously |
| **Status** | One of: `Proposed` / `Accepted` / `Superseded` / `Deprecated` |
| **Consequences** | What becomes true as a result — both intended and known trade-offs |
| **Alternatives Considered** | What was evaluated and why it was not chosen |

**Decision Register rules:**

- Decisions MUST be immutable once `Accepted` — they MAY only be `Superseded` by a newer entry that references the original by ID
- A `Superseded` entry MUST contain a forward reference to its replacement
- The replacement entry MUST contain a back reference to the entry it supersedes
- `DOCS/planning/backlog.md` items that resolve into a structural choice MUST produce a Decision Register entry before the work item is marked `Resolved`
- The AI Agent Instruction File (Section 10.4) MUST reference `decision-register.md` as the authoritative source for any rule it restates

**Entry identification:**

Each entry MUST have a unique, sequential identifier in the format `DR-[NNN]` (e.g. `DR-001`, `DR-042`). Identifiers MUST NOT be reused, even if an entry is superseded or deprecated.

### 10.7 Code Review Directory

A `code-review/` or `.review/` directory MUST exist at the repository root. It holds the outputs of comprehensive assessments of the project and its related test automation codebases. These outputs are first-class project artefacts, not disposable scratch notes.

**Contents:**

- Completed code review reports authored against the mandatory review template
- Assessment outputs produced by automated agents or tooling
- Any follow-up notes that document how a review finding was resolved

**Accepted output shapes:**

| Shape | Naming convention | Intended use |
|---|---|---|
| Single-file review | `.review/YYYY-MM-DD_short-slug.md` | Focused assessments and lightweight follow-up reviews |
| Multi-file review bundle | `.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/` | Comprehensive reviews with separate executive summary, risk, recommendation, migration, and annex files |

`[UTC]` MUST use the compact UTC timestamp format `YYYYMMDDTHHMMZ`. The multi-file review bundle convention is an accepted extension recorded in `decision-register.md` as DR-012.

**Rules:**

- Every review output MUST be authored from `templates/code-review.template.md`
- Review outputs MUST use one of the accepted output shapes above
- Multi-file review bundles MUST include a main index file named `00_CODE_REVIEW_[AGENT]_v[N]_[UTC].md`
- Review outputs are read-only once written — findings MUST NOT be edited after the fact; a new review supersedes an old one
- Action items raised in a review MUST be tracked in `DOCS/planning/backlog.md` or `decision-register.md` as appropriate; they MUST NOT remain only inside the review file

### 10.8 Implementation Logs Directory

An `implementation-logs/` directory MUST exist under `DOCS/` or at the repository root. It holds detailed logs documenting development sessions, recording what was built, what decisions were made in the moment, what bugs were encountered and fixed, and what was learned.

**Contents:**

- Session logs authored during or immediately after a development session
- Post-incident notes or retrospective observations
- Lessons-learned records that have not yet been elevated to a Decision Register entry

**Rules:**

- Every implementation log MUST be authored from `templates/implementation-log.template.md`
- Log files MUST be named with a UTC date prefix and a short session-topic slug (e.g. `2026-05-14_cors-middleware-debug.md`)
- Logs are append-only; they document what happened, not what should have happened
- A log entry that records a structural or process decision MUST result in a corresponding `decision-register.md` entry — the log is evidence; the Decision Register is the record
- Implementation logs are the authoritative source for the *why* behind code that exists but has no obvious rationale in the code itself; an Agent consulting the codebase SHOULD check this directory before concluding that a behaviour is unexplained

### 10.9 Naming Conventions — Project Standard

A `DOCS/design/naming-conventions.md` document MUST exist at `DOCS/design/naming-conventions.md`. It records the naming conventions adopted for the project and serves as the authoritative reference for any Agent or developer making naming decisions.

**The document MUST cover, at minimum:**

| Category | Examples of what to specify |
|---|---|
| Directory names | casing style, separator character, plural vs singular |
| File names | casing style, separator character, date prefix rules, extension conventions |
| Stack names | format, allowed characters, uniqueness constraints |
| Feature file names | word separator, alignment with scenario subject |
| Screenplay component names | Actor, Ability, Task, Question naming patterns |
| Memory key names | casing, word separator, prefix/suffix conventions |
| Step definition text | tense, voice (active/passive), parameter placeholder format |
| Tag names | canonical scope tags, lifecycle tags, Stack tag format |
| Document names | which documents use fixed names vs date-prefixed names |
| Generated artifact names | files and directories excluded from manual naming rules |

**Rules:**

- The document MUST be authored from `templates/naming-conventions.template.md`
- When a new naming pattern is introduced that is not covered by the existing document, the document MUST be updated before the pattern is used in the codebase
- Deviations from the stated conventions MUST be recorded in `decision-register.md` with a `Context` entry explaining why the deviation was necessary
- An Agent generating new files, components, or identifiers MUST consult this document before producing names

---

## 11. Onboarding a New Stack

The following checklist MUST be completed in order when adding a new Stack to a project that follows this architecture. Each step references the section of this document that governs it.

### Phase 1 — Define the Stack

- [ ] Assign a unique `STACK_NAME` following the project's naming convention
- [ ] Identify the surface type(s): `API`, `UI`, `CLI`, or a combination (Section 6)
- [ ] Identify the language and test framework to be used
- [ ] Record the decision to add this Stack in `decision-register.md` (Section 10.6)
- [ ] Add the Stack to the Stack inventory in the AI Agent Instruction File (Section 10.4)

### Phase 2 — Create the Directory Structure

- [ ] Create the Stack directory at the repository root, or under the documented Stack group directory, following the blueprint in Section 4
- [ ] Create `screenplay/abilities/`, `screenplay/actors/`, `screenplay/tasks/`, `screenplay/questions/`, `screenplay/support/` directories
- [ ] Create `tooling/` for test runner configuration
- [ ] Create `docs/` for Stack-level documentation

### Phase 3 — Implement the Subject Application

- [ ] Implement or configure the Subject Application to meet the contract for its surface type (Section 6)
- [ ] Verify the health-check / entry point / exit code contract is satisfied before writing any tests

### Phase 4 — Implement the Screenplay Layer

- [ ] Define Memory keys in `screenplay/support/memory-keys` using the canonical values from Section 8.1
- [ ] Implement the Actor following the contract in Section 3.1
- [ ] Implement Abilities appropriate to the surface type(s) following the taxonomy in Section 7
- [ ] Implement Tasks for each meaningful interaction
- [ ] Implement Questions for each observable state to be asserted

### Phase 5 — Implement Step Definitions

- [ ] Copy canonical feature files from `features_shared/` to the Stack's local `features/` directory (Section 5.2)
- [ ] Add Stack-specific or lifecycle tags to local feature files (do not modify the canonical files)
- [ ] Implement step definitions using the parameterised pattern from Section 5.4
- [ ] Verify that every step in every copied feature file has a corresponding step definition

### Phase 6 — Configure Orchestration

- [ ] Add the Stack to the orchestration scripts following the lifecycle for its surface type (Section 9.1)
- [ ] Verify that the Stack's test run produces a metrics artifact in the required formats (Section 9.2)

### Phase 7 — Write Documentation

- [ ] Author `docs/architecture.md` from `templates/stack-architecture.template.md`
- [ ] Author `docs/screenplay-guide.md` from `templates/screenplay-guide.template.md`
- [ ] Author `docs/qa-strategy.md` from `templates/qa-strategy.template.md`
- [ ] Author `docs/README.md` from `templates/stack-readme.template.md`
- [ ] Update the root `README.md` to include the new Stack
- [ ] Update `CHANGELOG.md` to record the addition

### Phase 8 — Verify Parity

- [ ] Confirm all Memory key constants match canonical values exactly (Section 8.1)
- [ ] Confirm all step definition Gherkin text matches canonical text exactly (Section 8.2)
- [ ] Confirm all Screenplay component signatures match the parity contract document (Section 8.3)
- [ ] Run the full parity checklist in Section 8.4
- [ ] If any gap exists, add it to `DOCS/planning/backlog.md` before marking onboarding complete

---

## Appendix A — Template File Index

The following templates MUST exist under `DOCS/templates/` before the first document of each type is authored.

| Template File | Governs |
|---|---|
| `readme.template.md` | Root `README.md` |
| `changelog.template.md` | Root `CHANGELOG.md` |
| `backlog.template.md` | `DOCS/planning/backlog.md` |
| `decision-record.template.md` | Root `decision-register.md` entries |
| `stack-architecture.template.md` | `docs/architecture.md` per Stack |
| `screenplay-guide.template.md` | `docs/screenplay-guide.md` per Stack |
| `qa-strategy.template.md` | `docs/qa-strategy.md` per Stack |
| `stack-readme.template.md` | `docs/README.md` per Stack |
| `parity-contract.template.md` | `DOCS/architecture/` parity contract |
| `subject-app-contract.template.md` | `DOCS/architecture/` subject application contract |
| `code-review.template.md` | `code-review/` or `.review/` review outputs |
| `implementation-log.template.md` | `DOCS/implementation-logs/` session logs |
| `naming-conventions.template.md` | `DOCS/design/naming-conventions.md` |
| `algorithm.template.md` | `DOCS/algorithm/` algorithm specification files |
| `memory-key-check.template.md` | `.batch/check-memory-key-parity` checker script (see Section 8.1) |

---

## Appendix B — Parity Compliance Checklist (Quick Reference)

Use this checklist to assess whether an existing Stack is in parity without reading the full document.

```
@util SURFACE (if applicable — Section 6.0)
  [ ] Subject Application class is instantiable directly in test process
  [ ] No shared mutable state exists between scenarios
  [ ] Fresh instance (or reset) created per scenario
  [ ] UseSubjectDirectly (or project-specific equivalent) Ability registered on Actor
  [ ] SOLVE_RESULT and ALGORITHM_PROGRESS Memory keys defined (or project equivalents)

MEMORY KEYS
  [ ] All constants defined in screenplay/support/memory-keys
  [ ] Constant name equals constant string value exactly
  [ ] All values match canonical values in parity contract document

FEATURE FILES
  [ ] All canonical features present in Stack's local features/ directory
  [ ] No scenarios added or removed relative to canonical files
  [ ] Stack-specific and lifecycle tags added locally only (canonical files unmodified)
  [ ] @pending tag applied to any scenario not yet implemented

STEP DEFINITIONS
  [ ] Gherkin text matches canonical text exactly for every step
  [ ] Steps are parameterised (no inline endpoint/field/value literals)

SCREENPLAY COMPONENTS
  [ ] Factory method names match parity contract
  [ ] Execution method names match parity contract (performAs / answeredBy)
  [ ] Memory keys written/read match documented contract

BACKLOG
  [ ] Any known gap is listed in DOCS/planning/backlog.md
  [ ] No undocumented intentional drift exists
```

---

*This document is governed by the Decision Register. Any change to normative rules (MUST / MUST NOT / REQUIRED) MUST produce a new entry in `decision-register.md` before the change is merged. Current version: v1.7 (2026-05-18).*
