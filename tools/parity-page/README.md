# Parity page tools

Tools for the three-Stack parity evidence page (BACKLOG-075, DR-047). See `DOCS/.planning/todo-parity-evidence-page.md` for the plan and slices.

This slice (S1) holds the result adapters and the results-level gate. They are not yet wired into CI.

| File | Purpose |
|------|---------|
| `adapters.mjs` | Reads each Stack's own results (Cucumber JSON for TypeScript and Python, Cucumber Messages for C#) into one shape, in feature-file order, and expands the feature file into the executions it should produce |
| `check-parity.mjs` | The gate. Fails on missing result files, wrong execution or step counts, differing scenario order or names, differing step text, or any execution not passed |
| `tests/` | `node --test` unit tests. Fixtures are trimmed from real results by `tests/make-fixtures.mjs` |

## Use

```bash
node tools/parity-page/check-parity.mjs
node --test tools/parity-page/tests/*.test.mjs
```

The gate reads `.results/demoapp001/test-results/cucumber.json`, `.results/demoapp002/test-results/pytest-cucumber.json` and `.results/demoapp003/test-results/reqnroll.ndjson`. Set `PARITY_RESULTS_DIR` to read another root, and `PARITY_FEATURE` to read another feature file. Exit 0 prints `PARITY PASS`; exit 1 lists every failure.

Node 24, no npm dependencies.
