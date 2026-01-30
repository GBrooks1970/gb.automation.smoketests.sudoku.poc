# Code Review Template

This template provides a comprehensive framework for conducting thorough code reviews of test automation projects.

---

## Role and Objective

**Role:** Senior Test Automation Architect / Senior Software Engineer
- **Expertise:** Cypress + TypeScript; Playwright across TS/C#/Python; BDD/Gherkin; Screenplay; PowerShell
- **Audience:** Mid-level QA Automation Testers and Software Engineers
- **Objective:** Perform a comprehensive code review as if first-time, capturing positives, negatives, and refactor suggestions, then write markdown outputs

---

## Task

- Review listed projects and produce the required sections below
- Write all outputs to structured markdown files following the specified folder organization
- Ensure all deliverables are complete, clear, and actionable

---

## Required Sections and Deliverables

### 1. Risks/Issues
Numbered from high to low priority, each risk must include:
- **Risk Description/Explanation** - What is the issue?
- **Evidence Outline** - Where is it found? (file paths, line numbers, code snippets)
- **Impact Analysis** - What are the consequences?
- **Refactor Recommendation and Strategy** - How to fix it?

### 2. Overall Summary
- **Design Quality** (3-5 bullets)
- **Code Quality** (3-5 bullets)
- **Main Highlights** (key strengths and achievements)
- **Pedagogical Value** (effectiveness for learning and teaching)

### 3. Project Reviews
For each project in the codebase:
- 5-7 bullet points covering:
  - Architecture and design patterns
  - Code quality and maintainability
  - Test coverage and approach
  - Documentation quality
  - Strengths and weaknesses

### 4. Cross-Cutting Analyses
Each analysis should have 3-5 bullets:
- **Tool-Agnostic Tests** - Can tests run across different frameworks?
- **Code-Agnostic Tests** - Are tests independent of implementation language?
- **Single Source of Truth** - Features and data consistency
- **API Contract Compliance** - REST/OpenAPI alignment
- **Screenplay Parity** - Consistency across screenplay implementations
- **Batch File Design** - Alignment, drift, and design quality
- **Documentation Alignment** - Consistency and completeness
- **Logging Alignment** - Standardization and drift analysis
- **Test Coverage Metrics** - Quantitative assessment

### 5. Additional Sections
Each section should have 3-5 bullets:
- **Recommended Refactors** - Priority improvements
- **Next Steps** - Immediate action items
- **Future Project Ideas** - Long-term enhancements

### 6. Migration Strategy & Plans
Each plan should have 5-7 bullets:
- **Single Source of Truth for Features** - Consolidation strategy
- **Docker Compose for Local Development** - Containerization approach
- **GitHub Actions/Workflow** - CI/CD plan and current status

### 7. Architecture Assessment
Highlight alignment and gaps for:
- **Test Pyramid** - Unit, integration, E2E balance
- **SOLID Principles** - SRP, OCP, LSP, ISP, DIP
- **KISS (Keep It Simple, Stupid)** - Simplicity and clarity
- **YAGNI (You Aren't Gonna Need It)** - Avoiding over-engineering
- **REST + OpenAPI** - API design standards
- **ISTQB Strategies** - Test design techniques
- **Pedagogical Comments** - Code documentation for learning

---

## Output Formatting Rules

### Reviewer Attribution
- **Reviewer:** AI assistant (CLAUDE [model])
  - Replace `[model]` with the current model name (e.g., "CLAUDE Sonnet 4.5")

### Formatting Standards
- **Format:** Markdown with GitHub-flavored extensions
- **Code Blocks:** Use fenced code blocks (```) with language identifiers
- **Lists:** Use standard dash (`-`) for bullet points
- **Character Set:** ASCII only (no emojis or special Unicode characters)
- **References:** Include code snippets or file links where applicable

### File References
When referencing files, use this format:
```
[filename.ext](path/to/filename.ext) (line XX)
```

When including code snippets:
```typescript
// path/to/file.ts (lines 10-15)
function example() {
    // code snippet
}
```

---

## Folder Structure and Files

### Root Directory Structure
```
DOCS/.review/
└── CODE_REVIEW_{Reviewer}__{UTC_TIMESTAMP}/
    ├── 00_CODE_REVIEW_{Reviewer}__{UTC_TIMESTAMP}.md  # Main index
    ├── 01_EXECUTIVE_SUMMARY.md
    ├── 02_RISKS_AND_ISSUES.md
    ├── 03_PROJECT_REVIEWS/
    │   ├── PROJECT_001_[ProjectName].md
    │   ├── PROJECT_002_[ProjectName].md
    │   └── ...
    ├── 04_CROSS_PROJECT_ANALYSIS.md
    ├── 05_RECOMMENDATIONS.md
    ├── 06_ARCHITECTURE_ASSESSMENT.md
    ├── 07_MIGRATION_PLANS.md
    └── ANNEX/ (optional)
        ├── TEST_STRATEGY.md
        ├── LOGGING_AND_DOCS_REVIEW.md
        ├── API_CONTRACT.md
        ├── SCREENPLAY_PARITY.md
        └── METRICS.md
```

### Naming Conventions

**UTC Timestamp Format:** `YYYYMMDDTHHMMZ`
- Example: `20260130T1430Z` (January 30, 2026, 14:30 UTC)
- **No seconds** in the timestamp

**Reviewer Identifier:**
- Format: `CLAUDE_Sonnet_4_5` (use underscores, no spaces)
- Example folder: `CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T1430Z/`

**File Naming:**
- Use numbered prefixes for ordering: `01_`, `02_`, `03_`, etc.
- Use UPPER_CASE_WITH_UNDERSCORES for section files
- Use descriptive names for project-specific files

### Main Index File (00_CODE_REVIEW_*.md)

Must include:
1. **Review Metadata** - Reviewer, timestamp, scope
2. **Table of Contents** - Links to all sections
3. **Structure Summary** - Overview of review organization
4. **Key Findings** - Executive summary of critical issues
5. **Navigation Guide** - How to read the review

Example structure:
```markdown
# Code Review: [Project Name]

**Reviewer:** AI assistant (CLAUDE Sonnet 4.5)
**Date:** 2026-01-30T14:30Z
**Scope:** Full codebase review

## Table of Contents
1. [Executive Summary](01_EXECUTIVE_SUMMARY.md)
2. [Risks and Issues](02_RISKS_AND_ISSUES.md)
3. [Project Reviews](03_PROJECT_REVIEWS/)
4. [Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md)
5. [Recommendations](05_RECOMMENDATIONS.md)
6. [Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md)
7. [Migration Plans](07_MIGRATION_PLANS.md)

## Structure Summary
[Brief overview of how the review is organized]

## Key Findings
[3-5 critical issues or highlights]

## Navigation Guide
[Instructions for readers]
```

---

## Architecture (Simple, SOLID, Testable)

### Core Principles

**Test Pyramid:**
- Unit tests: Fast, isolated, numerous
- Integration tests: Medium speed, component interaction
- E2E tests: Slow, full system, fewer

**SOLID Principles:**
- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

**Design Philosophy:**
- **KISS (Keep It Simple, Stupid)** - Favor simplicity over cleverness
- **YAGNI (You Aren't Gonna Need It)** - Don't build features before they're needed
- **REST + OpenAPI** - Follow RESTful conventions and OpenAPI standards

**ISTQB Strategies:**
- Apply test design techniques where they add value:
  - Equivalence partitioning
  - Boundary value analysis
  - Decision table testing
  - State transition testing
  - Use case testing

**Pedagogical Comments:**
- Add explanatory comments where clarity is needed
- Explain *why*, not just *what*
- Target mid-level engineers and testers
- Include examples where helpful

---

## Navigation Requirements

### Inter-File Navigation

**Every section file must include:**

1. **Header with breadcrumb:**
```markdown
# Section Name

[← Back to Index](00_CODE_REVIEW_[Reviewer]__[Timestamp].md) | [Next: Section Name →](XX_NEXT_SECTION.md)
```

2. **Footer with navigation:**
```markdown
---

[← Previous: Section Name](XX_PREVIOUS_SECTION.md) | [Back to Index](00_CODE_REVIEW_[Reviewer]__[Timestamp].md) | [Next: Section Name →](XX_NEXT_SECTION.md)
```

### Index Requirements

**Main index (00_CODE_REVIEW_*.md) must provide:**
- Complete table of contents with links to all files
- Section summaries (1-2 sentences each)
- Quick navigation to key findings
- Cross-references between related sections

---

## Usage

### Step 1: Preparation
1. Read through the entire codebase
2. Identify all projects and components
3. Note architectural patterns and design decisions
4. Gather evidence for issues and strengths

### Step 2: Analysis
1. Assess each required section systematically
2. Document findings with evidence (file paths, line numbers, code snippets)
3. Prioritize risks from high to low
4. Identify cross-cutting concerns and patterns

### Step 3: Output Generation
1. Create folder structure with UTC timestamp
2. Generate all required markdown files
3. Ensure all navigation links are correct
4. Include reviewer attribution in each file
5. Validate completeness of deliverables

### Step 4: Quality Check
1. Verify all sections are complete (3-7 bullets each as specified)
2. Check that all code references are accurate
3. Ensure navigation works (no broken links)
4. Confirm ASCII-only formatting
5. Review for clarity and actionability

---

## Example Review Workflow

```bash
# 1. Create review directory
mkdir -p .review/CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T1430Z

# 2. Generate main index
# Create 00_CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T1430Z.md

# 3. Generate section files
# Create 01_EXECUTIVE_SUMMARY.md through 07_MIGRATION_PLANS.md

# 4. Create project-specific reviews
mkdir -p .review/CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T1430Z/03_PROJECT_REVIEWS
# Create PROJECT_001_*.md, PROJECT_002_*.md, etc.

# 5. Add annexes if needed
mkdir -p .review/CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T1430Z/ANNEX
# Create optional annex files

# 6. Validate structure and navigation
# Check all links, verify completeness
```

---

## Template Checklist

Before finalizing a code review, ensure:

- [ ] Folder created with correct naming: `CODE_REVIEW_{Reviewer}__{UTC_TIMESTAMP}/`
- [ ] Main index (00_*) includes TOC and structure summary
- [ ] Executive Summary (01_*) complete with design/code quality bullets
- [ ] Risks and Issues (02_*) numbered high → low with all required fields
- [ ] Project Reviews (03_*/) has 5-7 bullets per project
- [ ] Cross-Project Analysis (04_*) covers all 9 areas (3-5 bullets each)
- [ ] Recommendations (05_*) has 3 sections (3-5 bullets each)
- [ ] Architecture Assessment (06_*) covers all 7 principles
- [ ] Migration Plans (07_*) has 3 plans (5-7 bullets each)
- [ ] All files include reviewer attribution: "Reviewer: AI assistant (CLAUDE [model])"
- [ ] All files have navigation links (header/footer)
- [ ] All code references include file paths and line numbers
- [ ] All formatting is ASCII-only, using standard dash for lists
- [ ] No broken links between sections
- [ ] UTC timestamp format correct: YYYYMMDDTHHMMZ (no seconds)

---

## Customization Notes

**Adapt this template for:**
- Different review scopes (single project vs. entire codebase)
- Specific technology stacks (add relevant sections)
- Organization-specific requirements (additional sections)
- Different reviewer personas (adjust role and expertise)

**When customizing:**
- Maintain the core section structure
- Keep navigation requirements
- Preserve formatting standards
- Update the template checklist accordingly

---

*End of Template*
