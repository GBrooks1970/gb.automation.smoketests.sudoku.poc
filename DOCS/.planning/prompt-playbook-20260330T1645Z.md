# AI Agent Prompt Playbook

**Project:** gb.automation.smoketests.sudoku.poc
**Generated:** 2026-03-30T16:45:00Z
**Branch:** claude/sudoku-solver-design-f3NRI
**Purpose:** Reproducible prompt sequence to recreate all design, planning, and review artifacts from this project session.

---

## Prerequisites

- Repository: `gb.automation.smoketests.sudoku.poc` cloned and checked out
- The base project (TypeScript Sudoku solver with 5 source files, puzzles.json, Gherkin feature file, algorithm docs, and initial code review) must already exist
- Working branch created from main

---

## Prompt Sequence

Execute the following prompts in order. Each prompt builds on the output of the previous one.

### Phase 1: Design Document and TODO for Web UI Feature

1. **Analyse the current design documents and then create a design document in similar format that outlines the design and implementation plan to create a simple webpage that will show the puzzle, steps and events towards solution and the end result of the attempt to solve the puzzle via the sudoku solver. Before starting write the Todo list to a markdown file so that it can be picked up by other AI agents**

   *Expected output:*
   - `DOCS/.design/web-ui-solver-visualisation.md` (~1,300 lines) - Full design document with architecture, SolveStepTracker wrapper, API spec, frontend components, implementation phases
   - `DOCS/.planning/todo-web-ui-solver-visualisation.md` (~135 lines) - 8-phase checklist with dependency diagram and technical decisions

### Phase 2: TODO Task Lists for Existing Design Documents

2. **Repeat the same process with existing 'Audit Trail Feature Design Document' and 'REST API Wrapper for Sudoku Solver - Design Document'. Create a TODO list for each in a similar format to the Web UI you have just produced. Write the Todo list to a markdown file so that it can be picked up by other AI agents**

   *Expected output:*
   - `DOCS/.planning/todo-audit-trail-feature.md` (~286 lines) - 5-phase checklist derived from Audit Trail design
   - `DOCS/.planning/todo-rest-api-wrapper.md` (~381 lines) - 8-phase checklist derived from REST API design

### Phase 3: Commit and Push

3. **Create a new pr**

   *Expected output:*
   - All files committed to feature branch
   - Pushed to remote
   - PR created (or manual creation link provided if GitHub API auth is unavailable)

### Phase 4: UI Wireframes

4. **Add a visual representation of the expected webpage in a UI wireframe**

   *Expected output:*
   - `DOCS/.design/web-ui-solver-visualisation.md` updated to v1.1 with new Section 11 containing 9 ASCII wireframes (~529 lines added):
     - Initial page load state
     - Mid-solve state (step 12 of 45)
     - Solved state
     - Stuck on advanced logic state
     - Grid cell detail (original vs solved)
     - Playback controls detail
     - Event log entry detail
     - Statistics panel detail
     - Responsive/mobile layout

### Phase 5: Comprehensive Code Review

5. **Use the code review template to perform a thorough and comprehensive code review of this project. Use the latest existing code review as context. Make the new code review follows the same format and style as the existing one. After completing the code review, look to update the backlog to give a clear step by step plan to properly categorise and prioritize the outstanding implementation of the design plans.**

   *Expected output:*
   - `DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/` directory with 10 files:
     - `00_CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z.md` - Main index with TOC, key findings, overall grade (B+)
     - `01_EXECUTIVE_SUMMARY.md` - Design quality, code quality, highlights, pedagogical value, comparison with prior review
     - `02_RISKS_AND_ISSUES.md` - 8 risks (3 new, 5 carried forward) with evidence, impact, and remediation
     - `03_PROJECT_REVIEWS/PROJECT_001_DEMOAPP001_TypeScript.md` - Source code review (7 architecture, 7 code quality, 6 test, 5 doc bullets)
     - `03_PROJECT_REVIEWS/PROJECT_002_Design_and_Planning.md` - Documentation ecosystem review
     - `04_CROSS_PROJECT_ANALYSIS.md` - 9 cross-cutting concern analyses
     - `05_RECOMMENDATIONS.md` - 5 prioritised refactors, 4-tier next steps timeline, 12 future ideas
     - `06_ARCHITECTURE_ASSESSMENT.md` - SOLID, KISS, YAGNI, Test Pyramid, REST, ISTQB, pedagogical assessment
     - `07_MIGRATION_PLANS.md` - 3 plans: unified feature implementation, CI/CD pipeline, multi-language strategy
     - `README.md` - Quick reference for the review directory
   - `DOCS/.planning/backlog.md` updated with:
     - Sprint dates reset to 2026-03-30
     - Unified feature implementation strategy diagram
     - New items: BACKLOG-017 (unify designs), BACKLOG-018 (Web UI implementation)
     - 7-sprint roadmap with dependencies
     - Updated project health metrics

---

## Verification Checklist

After executing all prompts, verify:

- [ ] `DOCS/.design/web-ui-solver-visualisation.md` exists (v1.1 with wireframes)
- [ ] `DOCS/.planning/todo-web-ui-solver-visualisation.md` exists (8 phases)
- [ ] `DOCS/.planning/todo-audit-trail-feature.md` exists (5 phases)
- [ ] `DOCS/.planning/todo-rest-api-wrapper.md` exists (8 phases)
- [ ] `DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/` exists (10 files)
- [ ] `DOCS/.planning/backlog.md` updated with 18 backlog items and sprint roadmap
- [ ] All navigation links between review files resolve correctly
- [ ] All cross-references to design documents use correct filenames
- [ ] Branch pushed to remote with 4 commits

---

## Commit History (Expected)

```
1. Add design document and TODO for web UI solver visualisation
2. Add TODO task lists for Audit Trail and REST API features
3. Add UI wireframes to Web UI Solver Visualisation design document
4. Add comprehensive code review (Opus 4.6) and update backlog with unified implementation plan
```

---

## Notes for Reproducing Agent

- The code review template is at `DOCS/.review/code-review-template.md` - follow it exactly
- The existing code review at `DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z/` provides the format and style to match
- The design document template is at `DOCS/.design/TEMPLATE_Design_Document.md` - all design docs follow this structure
- TODO files use a consistent format: overview, prerequisites, phased checkboxes, technical decisions table, dependency diagram, files to create/modify, and notes for implementing agent
- The backlog uses status indicators (emoji) and structured item format with acceptance criteria, dependencies, and file references
- ASCII wireframes use box-drawing characters and fixed-width formatting
- All documentation uses ASCII only (no special Unicode characters beyond standard emoji status indicators in the backlog)
