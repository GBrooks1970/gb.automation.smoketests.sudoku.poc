# DEMOAPP003_CSHARP_SPECFLOW — QA Strategy

**Stack:** DEMOAPP003_CSHARP_SPECFLOW
**Surface type:** @util
**Last updated:** 2026-05-28

## 1. What Is Tested

The Stack runs the full canonical Sudoku solver feature contract against the C# in-process subject application.

| Category | Scenarios | Coverage goal |
|----------|-----------|---------------|
| Solver algorithms | Unit Completion, Hidden Singles, Naked Singles | Parity with canonical behavior |
| Orchestration | Solve loop and stuck status | Same statuses as TypeScript/Python |
| Puzzle loading | JSON loading and validation | Same fixture contract |
| Audit trail | Cell changes and statistics | Same observable audit behavior |

## 2. Technique Coverage

| Technique | Applied to |
|-----------|------------|
| Equivalence Partitioning | Valid/invalid placement and puzzle loading |
| Boundary Value Analysis | Grid dimensions and cell value range |
| Decision Table | Constraint validation scenario outline |
| State Transition | Solve-loop progress and stuck exits |
| Error Guessing | Missing files, invalid grids, duplicate values |

## 3. Explicitly Out of Scope

- API/UI/CLI testing — covered by DEMOAPP001 or future backlog items.
- Performance gating — benchmarks report timings only.
- Advanced solving techniques — tracked by BACKLOG-014.

## 4. Test Data Strategy

- Setup: every scenario creates a fresh actor and solver ability.
- Isolation: solver grids are deep-copied before mutation.
- Teardown: Memory is discarded when SpecFlow creates the next scenario actor.
- External data: `puzzles.json` is stack-local and read-only during tests.

## 5. Coverage Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Scenarios | 46 | 46 |
| Pass rate | 100% | 100% |
| Scenarios tagged @pending | 0 | 0 |

## 6. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Step text drift | Low | High | Automated step-text parity script includes DEMOAPP003 |
| Memory key drift | Low | High | Automated Memory key parity script includes C# regex |
| Solver behavior divergence | Medium | High | Full canonical feature suite runs under `dotnet test` |

## 7. Related Documents

- `docs/architecture.md`
- `docs/screenplay-guide.md`
- `DOCS/.planning/backlog.md`
