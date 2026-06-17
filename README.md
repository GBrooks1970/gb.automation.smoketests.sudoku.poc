# Sudoku Solver - Tech-Agnostic Design Specification

[![CI](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/actions/workflows/ci.yml/badge.svg)](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/actions/workflows/ci.yml)

> **A pedagogical project demonstrating clean architecture, test automation, and multi-stack implementations of the same design specification.**

**Platform specification:** v1.1 (authoritative) — see [sudoku-solver-platform-specification.md](DOCS/.design/sudoku-solver-platform-specification.md)
**Core solver baseline:** v1.0 — see [sudoku-solver-specification.md](DOCS/.design/sudoku-solver-specification.md)
**Date:** 2026-01-30T20:00Z (core baseline); platform v1.1 accepted 2026-06-12 (DR-034)

## Overview

This repository contains:
1. **A comprehensive, tech-agnostic design specification** for a Sudoku solver
2. **Multiple implementations** of the same specification in different technology stacks
3. **Design documents** for extended features (audit trails, REST APIs)
4. **Test specifications** using Gherkin/BDD for behavior verification

The solver implements three fundamental Sudoku solving techniques:
- **Unit Completion** - Fills cells in rows/columns/blocks with only one empty space
- **Hidden Singles** - Finds where a digit must go within a unit
- **Naked Singles** - Finds cells that can only contain one digit

## Design-First Approach

This project follows a **specification-driven development** model:

```
    ┌──────────────────────────────────────┐
    │  Tech-Agnostic Design Specification  │  ← Single source of truth
    └────────────────┬─────────────────────┘
                 │
        ┌────────┴────────┬─────────────────┐
        ▼                 ▼                 ▼
   ┌──────────┐      ┌────────────┐      ┌──────────┐
   │TypeScript│      │   Python   │      │    C#    │  ← Multiple implementations
   │+ Cucumber│      │+ pytest-bdd│      │+ SpecFlow│
   └──────────┘      └────────────┘      └──────────┘
```

All implementations follow the same:
- Architecture patterns (SRP, clean architecture)
- Algorithm specifications (deterministic, logic-based)
- Component responsibilities (Solver, Orchestrator, Loader, Display)
- Behavior expectations (testable via Gherkin scenarios)

## Repository Structure

```
gb.automation.smoketests.sudoku.poc/
├── DOCS/                                    # Tech-agnostic documentation
│   ├── .design/                             # Design documents
│   │   ├── sudoku-solver-specification.md    # Core specification (language agnostic)
│   │   ├── audit-trail-feature.md            # Audit trail feature design
│   │   └── rest-api-wrapper.md               # REST API wrapper design
│   └── sudoku-basic-solver.md         # Algorithm details with pseudocode
│
├── demo-apps/                               # Technology-specific implementations
│   ├── demoapp001-typescript-cypress/       # TypeScript + Node.js implementation
│   │   ├── README.md                        # Implementation-specific guide
│   │   ├── app_src/                         # TypeScript source code
│   │   ├── tests/                           # Test specifications
│   │   └── puzzles.json                     # Test puzzle data
│   │
│   ├── demoapp002-python-pytest/            # Python + pytest-bdd implementation
│   └── demoapp003-csharp-specflow/          # C# + SpecFlow implementation
│
└── README.md                                # This file
```

## Documentation

### Core Specifications

| Document | Purpose | Audience |
|----------|---------|----------|
| [sudoku-solver-platform-specification.md](DOCS/.design/sudoku-solver-platform-specification.md) | **Authoritative platform specification (v1.1)** — classifies the core contract, deliberate extensions, parity rules, and staged surfaces | Maintainers, reviewers, new stack authors |
| [sudoku-solver-specification.md](DOCS/.design/sudoku-solver-specification.md) | Core solver baseline (v1.0) — language-agnostic algorithmic specification | Developers implementing the core solver in any language |
| [sudoku-basic-solver.md](DOCS/.algorithm/sudoku-basic-solver.md) | Detailed algorithm descriptions with examples | Developers & educators |
| [BasicSudokuSolverLogic.feature](demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature) | BDD test scenarios (Gherkin) | QA & developers |

### Extended Feature Designs

| Document | Purpose | Status |
|----------|---------|--------|
| [audit-trail-feature.md](DOCS/.design/audit-trail-feature.md) | Audit trail logging system | Design complete |
| [rest-api-wrapper.md](DOCS/.design/rest-api-wrapper.md) | REST API wrapper specification | Implemented for DEMOAPP001 |

## Demo Applications

### DEMOAPP001: TypeScript + Node.js

**Status:** ✅ Implemented

**Tech Stack:** TypeScript, Node.js, ts-node, Express.js

**Quick Start:**
```bash
cd demo-apps/demoapp001-typescript-cypress
npm install
npm start
```

**Features:**
- ✅ Three core solving algorithms
- ✅ CLI interface with grid visualization
- ✅ JSON-based puzzle loading
- ✅ Comprehensive test scenarios (Gherkin)
- ✅ Audit trail feature
- ✅ REST API wrapper

See [DEMOAPP001 README](demo-apps/demoapp001-typescript-cypress/README.md) for implementation details.

### DEMOAPP002: Python + pytest-bdd

**Status:** ✅ Implemented

**Tech Stack:** Python 3.13, pytest, pytest-bdd

**Quick Start:**
```bash
cd demo-apps/demoapp002-python-pytest
python -m pip install -e ".[test]"
python -m pytest
```

**Features:**
- ✅ Python solver implementation for the shared `@util` surface
- ✅ JSON-based puzzle loading
- ✅ Screenplay-style abilities, tasks, questions, and actor memory
- ✅ Shared canonical Gherkin scenarios via pytest-bdd

### DEMOAPP003: C# + SpecFlow

**Status:** ✅ Implemented

**Tech Stack:** C#, .NET 8, SpecFlow, NUnit

**Quick Start:**
```bash
cd demo-apps/demoapp003-csharp-specflow
dotnet restore
dotnet test
```

**Features:**
- ✅ C# solver implementation for the shared `@util` surface
- ✅ JSON-based puzzle loading
- ✅ Screenplay-style abilities, tasks, questions, and actor memory
- ✅ Shared canonical Gherkin scenarios via SpecFlow

### Stack Capability Matrix

Core solver and BDD/Screenplay parity are **required** for every stack. Operational surfaces (REST
API, web UI) are **staged capability**: DEMOAPP001 (TypeScript) is the pioneer stack, and API/web
capability is on the **roadmap** for DEMOAPP002 (Python) and DEMOAPP003 (C#) — their current absence
is a staging decision, not a parity failure. See the authoritative matrix in the
[platform specification §6.1](DOCS/.design/sudoku-solver-platform-specification.md#61-stack-capability-matrix).

| Capability | DEMOAPP001 (TS) | DEMOAPP002 (Py) | DEMOAPP003 (C#) | Parity status |
|------------|:---------------:|:---------------:|:---------------:|---------------|
| Core solver | ✅ | ✅ | ✅ | Required |
| BDD/Screenplay parity (46 scenarios) | ✅ | ✅ | ✅ | Required |
| Audit trail | ✅ | ✅ | ✅ | Extension (all stacks) |
| CLI / grid display | ✅ | ➖ | ➖ | Staged (DEMOAPP001) |
| REST API | ✅ | 🛣️ | 🛣️ | Staged; roadmap for Py/C# |
| Web UI visualisation | ✅ | 🛣️ | 🛣️ | Staged; roadmap for Py/C# |
| Performance tooling | ✅ | ✅ | ✅ | Extension (all stacks) |

Legend: ✅ present · 🛣️ roadmap · ➖ not carried (no roadmap commitment).

### Repository-Level Commands

```powershell
.\.batch\run-parity-checks.ps1
.\.batch\run-performance-benchmarks.ps1
docker compose config
docker compose run --rm demoapp001-tests
docker compose run --rm demoapp002-tests
docker compose run --rm demoapp003-tests
docker compose run --rm parity-checks
docker compose --profile api up demoapp001-api
docker compose --profile benchmark run --rm performance-benchmarks
```

Performance results are reporting-only and are written to `.results/performance/`.
Docker runtime commands require Docker Desktop or another Docker Engine with Compose v2.

## Key Design Principles

### 1. Tech-Agnostic Specification
The [core design specification](DOCS/.design/sudoku-solver-specification.md) uses pseudocode and conceptual descriptions, allowing implementation in any language.

### 2. Clean Architecture (Simple, SOLID, Testable)

All implementations follow established software engineering principles:

**SOLID Principles:**
- **Single Responsibility Principle (SRP)** - Each component has one clear purpose
- **Open/Closed Principle** - Algorithms can be extended without modifying core logic
- **Dependency Inversion** - Components depend on abstractions, not implementations
- **Separation of Concerns** - Solver, Orchestrator, Loader, Display are independent

**Design Philosophy:**
- **KISS (Keep It Simple, Stupid)** - Straightforward implementations, no over-engineering
- **YAGNI (You Aren't Gonna Need It)** - Only implement what's specified, no premature features
- **Test Pyramid** - Unit tests for algorithms, integration tests for orchestration, BDD for behavior
- **REST/OpenAPI Alignment** - API designs follow RESTful conventions and OpenAPI standards

**Testing Approach:**
- **ISTQB Techniques** - Boundary value analysis, equivalence partitioning where valuable
- **BDD (Gherkin)** - Behavior-driven test scenarios for acceptance criteria
- **Unit Testability** - Each algorithm callable independently with deterministic results

**Code Quality:**
- **Minimal Comments** - Code should be self-documenting through clear naming
- **Pedagogical Comments** - Concise explanations only where algorithms or logic need clarity
- **Simple Design** - Avoid complexity; prioritize readability and maintainability

### 3. Testability
- **BDD scenarios** in Gherkin for behavior verification
- **Unit testable** algorithms (each can be called independently)
- **Deterministic** solving (same input always produces same moves)

### 4. Pedagogical Value (Learning and Teaching Effectiveness)

**Primary Audience:**
- **Mid-level QA Automation Testers** - Learning test automation patterns and BDD
- **Mid-level Software Engineers** - Implementing clean architecture and SOLID principles
- **Technical Educators** - Teaching algorithmic problem-solving and testing practices

**Documentation Approach:**
- **Comprehensive Design Specs** - Tech-agnostic specifications serve as learning blueprints
- **Pedagogical Code Comments** - Inline documentation explains *why*, not just *what*
- **Visual Diagrams** - Architecture diagrams, data flows, and algorithm examples
- **Incremental Complexity** - Techniques ordered from simplest (Unit Completion) to most complex (Naked Singles)

**Testing Patterns:**
- **AAA Pattern Consistency** - All tests follow Arrange-Act-Assert structure
- **BDD Scenarios** - Given-When-Then format for clear behavior specification
- **Gherkin Examples** - 46 scenarios per stack (138 across all three; DEMOAPP001 = 46 scenarios / 257 steps) demonstrating comprehensive coverage
- **Test Pyramid** - Unit tests (fast), integration tests (medium), BDD tests (slow but comprehensive)

**Cross-References and Traceability:**
- **Canonical Source** - [sudoku-solver-platform-specification.md](DOCS/.design/sudoku-solver-platform-specification.md) (v1.1) is the authoritative platform specification; [sudoku-solver-specification.md](DOCS/.design/sudoku-solver-specification.md) (v1.0) remains the core solver baseline
- **Algorithm Details** - [sudoku-basic-solver.md](DOCS/.algorithm/sudoku-basic-solver.md) provides pseudocode and examples
- **Implementation Links** - Code comments reference specification sections for traceability
- **Test-to-Spec Mapping** - Each Gherkin scenario maps to specification requirements

**Transparency and Reasoning:**
- **Deterministic Logic** - Same input always produces same solving sequence
- **Audit Capability** - Each move has a logical justification (design available)
- **Step-by-Step Visibility** - Clear progression through solving techniques

## Solving Capabilities

| Puzzle Difficulty | Typical Outcome | Techniques Required |
|-------------------|-----------------|---------------------|
| Easy | ✅ Solved | Mostly Unit Completion |
| Medium | ✅ Often solved | All three basic techniques |
| Hard | ⚠️ Usually stuck | Requires advanced techniques |
| Expert | ❌ Stuck | Requires advanced techniques |

**By Design:** The solver does NOT use backtracking or brute-force methods. Puzzles requiring advanced techniques (Naked Pairs, X-Wing, etc.) will return `STUCK_ON_ADVANCED_LOGIC`.

## Contributing

When implementing in a new technology stack:

1. **Follow the specification** in [sudoku-solver-specification.md](DOCS/.design/sudoku-solver-specification.md)
2. **Create a new demo app folder** following the documented `demoappNNN-language-framework` convention
3. **Include a README** specific to that implementation
4. **Implement the Gherkin scenarios** from the test specification
5. **Maintain the same behavior** across all implementations

## License

This is an educational project. See LICENSE file for details.

## Questions or Feedback?

- 📖 Start with the [Design Specification](DOCS/.design/sudoku-solver-specification.md)
- 🧩 See [Algorithm Details](DOCS/.algorithm/sudoku-basic-solver.md) for technique explanations
- 💻 Check [DEMOAPP001 README](demo-apps/demoapp001-typescript-cypress/README.md) for implementation example
