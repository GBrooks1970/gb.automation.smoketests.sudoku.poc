# Cross-Project Analysis

[Previous: Project Reviews](03_PROJECT_REVIEWS/) | [Back to Index](00_CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z.md) | [Next: Recommendations](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (GPT-5.3 Codex)  
**Date:** 2026-05-30T08:23Z

## Tool-Agnostic Tests

- The shared Gherkin feature body is the strongest tool-agnostic artefact; it is consumed by Cucumber.js, pytest-bdd, and SpecFlow.
- Screenplay implementations vary by language but preserve the same behavioural vocabulary.
- API tests are TypeScript-specific and should not be treated as tool-agnostic parity tests.
- Docker Compose gives a cross-stack command surface, but each service still runs native tooling.

## Code-Agnostic Tests

- The feature scenarios describe Sudoku behaviour, not language-specific APIs, so they are largely code-agnostic.
- Some step wording exposes implementation concepts such as `origGrid`, which creates mild leakage from the TypeScript naming into the shared contract.
- The shared feature's expanded Hidden Singles scenarios reflect current repository behaviour rather than the narrower v1.0 algorithm text.
- The feature contract now supersedes v1.0 for executable expectations.

## Single Source of Truth

- v1.0 is the original design source for the solver core.
- The shared feature is the executable behavioural source for stack parity.
- Extended design documents are the sources for REST and audit features.
- These sources are complementary, but their hierarchy is not explicit enough for new contributors.

## API Contract Compliance

- v1.0 has no REST API contract; the REST API belongs to the later API wrapper design.
- TypeScript implements technique, solve, validation, visualisation, and health behaviours covered by API integration tests.
- Python and CSharp do not expose REST API contracts, so API compliance is TypeScript-only.
- There is no OpenAPI file visible in the reviewed file list, so API contract validation appears test-driven rather than schema-driven.

## Screenplay Parity

- All stacks include Screenplay-style folders for abilities, actors/support, tasks, questions, fixtures, and step definitions.
- Stack-specific implementations maintain behavioural parity through copied feature files.
- TypeScript documentation is the most detailed on Screenplay architecture.
- Python and CSharp are sufficiently aligned structurally but have less explanatory documentation than TypeScript.

## Batch and Workflow Design

- Docker Compose is a strong current workflow layer for stack tests, API serving, parity checks, and benchmarks.
- Per-stack commands remain clear in README files and package/project configuration.
- Compose profiles correctly separate optional API and benchmark workflows from default test services.
- Cross-platform batch/PowerShell parity scripts are referenced by Compose but were not deeply reviewed here.

## Documentation Alignment

- v1.0 solver design, README, per-stack docs, API design, audit design, and review/log governance are generally coherent.
- Documentation drift exists because the first solver specification does not capture row/column Hidden Singles, audit/API/web, or multi-stack parity status.
- Per-stack READMEs accurately describe their local surfaces.
- A platform-level version map would reduce ambiguity about which document governs which capability.

## Logging Alignment

- Audit logging is implemented across the solver stacks and attaches algorithm names to changes.
- The audit design requires change details including coordinates, old/new values, algorithm, timestamp, and iteration; implementations appear aligned in spirit, but timestamp details were not exhaustively checked in this review.
- Audit logging is optional and enabled through orchestrator configuration, which preserves basic solver simplicity.
- Audit trail support exceeds v1.0 but strengthens the v1.0 debuggability goal.

## Test Coverage Metrics

- The shared feature contains scenario coverage for every v1.0 algorithm test recommendation and additional behaviours.
- TypeScript adds API integration coverage beyond the shared feature.
- Docker Compose defines test execution for all three stacks.
- Quantitative code coverage reports were not generated as part of this review; this assessment is structural, not line-coverage-based.

---

[Previous: Project Reviews](03_PROJECT_REVIEWS/) | [Back to Index](00_CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z.md) | [Next: Recommendations](05_RECOMMENDATIONS.md)
