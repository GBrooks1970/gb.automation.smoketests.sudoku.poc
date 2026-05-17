# How-To Guides

This directory contains practical, task-oriented tutorials for working with this project.

## Purpose

How-to guides are distinct from design documents and algorithm documentation:

| Document type | Answers | Located in |
|---------------|---------|------------|
| Design documents | *What should we build and why?* | `DOCS/.design/` |
| Algorithm docs | *How does the code work?* | `DOCS/` |
| **How-to guides** | ***How do I do X right now?*** | `DOCS/.howto/` |
| Implementation logs | *What did we build and what did we learn?* | `DOCS/.implementation/` |

How-to guides assume the reader wants to accomplish a specific task. They are step-by-step, practical, and written for someone who has the codebase in front of them.

---

## Available Guides

| Guide | Topic | Audience |
|-------|-------|----------|
| [debug-sudoku-solver.md](debug-sudoku-solver.md) | Set up a debugger and step through the solver | Developers new to the project |

---

## Writing a New Guide

Use [TEMPLATE_HowTo.md](TEMPLATE_HowTo.md) as the starting point for every new guide.

**Naming convention:** `HOWTO_{Topic}.md` — use PascalCase, underscores between words.

**Examples:**
- `HOWTO_Add_A_New_Puzzle.md`
- `HOWTO_Run_Tests_With_Cucumber.md`
- `HOWTO_Implement_A_New_Solving_Algorithm.md`
