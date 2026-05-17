# How-To Guides

This directory contains practical, task-oriented guides for working with this project.

## Purpose

How-to guides are distinct from design documents and algorithm documentation:

| Document type | Answers | Located in |
|---------------|---------|------------|
| Design documents | *What should we build and why?* | `DOCS/.design/` |
| Algorithm docs | *How does the code work?* | `DOCS/.algorithm/` |
| **How-to guides** | ***How do I do X right now?*** | `DOCS/.howto/` |
| Implementation logs | *What did we build and what did we learn?* | `DOCS/.implementation-logs/` |

How-to guides assume the reader wants to accomplish a specific task. They are step-by-step, practical, and written for someone who has the codebase in front of them.

---

## Available Guides

| Guide | Topic | Difficulty | Audience |
|-------|-------|------------|----------|
| [debug-sudoku-solver.md](debug-sudoku-solver.md) | Attach VS Code debugger and step through the solver | Beginner | Developers new to the project |
| [add-a-puzzle.md](add-a-puzzle.md) | Add a new puzzle to puzzles.json | Beginner | All contributors |
| [add-a-solving-algorithm.md](add-a-solving-algorithm.md) | Implement a new solving technique end-to-end | Advanced | Solver developers |
| [add-a-gherkin-scenario.md](add-a-gherkin-scenario.md) | Write a new BDD scenario using the Screenplay pattern | Intermediate | All contributors |
| [run-the-orchestration-script.md](run-the-orchestration-script.md) | Run the batch script and interpret its output | Beginner | New contributors, CI setup |
| [create-a-decision-register-entry.md](create-a-decision-register-entry.md) | Create a valid DR entry in decision-register.md | Intermediate | All contributors, AI agents |
| [onboard-a-new-stack.md](onboard-a-new-stack.md) | Add a second language Stack following RA §11 | Advanced | Stack 2 lead |

---

## Writing a New Guide

Use [`DOCS/.templates/howto.template.md`](../.templates/howto.template.md) as the starting point for every new guide.

**Naming convention (DR-020):** `verb-noun.md` — lowercase kebab-case.

**Examples:**
- `add-a-puzzle.md`
- `run-the-orchestration-script.md`
- `create-a-decision-register-entry.md`

After authoring, add a row to the Available Guides table above.
