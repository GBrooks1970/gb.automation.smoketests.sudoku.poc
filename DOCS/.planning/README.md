# Planning Directory

This directory contains project planning artifacts, including the product backlog, sprint plans, and roadmap documents.

## Purpose

Planning documents serve as:
- **Prioritized Work Queue** - Organized list of tasks, features, and improvements
- **Sprint Planning Input** - Source for sprint backlog creation
- **Progress Tracking** - Visibility into completed, in-progress, and planned work
- **Dependency Management** - Clear relationships between backlog items
- **Stakeholder Communication** - Transparent view of project direction and priorities

## Directory Contents

### Active Documents

- **[backlog.md](backlog.md)** - Product backlog with prioritized work items
  - Current sprint backlog
  - High/Medium/Low priority items
  - Future enhancements and ideas
  - Status tracking and estimates
- **Backlog-linked TODO files** - Implementation checklists for active or archived backlog work
  - [todo-csharp-screenplay-stack.md](todo-csharp-screenplay-stack.md) - BACKLOG-021, complete
  - [todo-docker-compose-local-development.md](todo-docker-compose-local-development.md) - BACKLOG-010, in progress
  - [todo-performance-benchmarking-suite.md](todo-performance-benchmarking-suite.md) - BACKLOG-011, complete
  - [todo-advanced-solving-techniques.md](todo-advanced-solving-techniques.md) - BACKLOG-014, future
  - [todo-puzzle-generator.md](todo-puzzle-generator.md) - BACKLOG-016, future
  - [todo-interactive-sudoku-tutor.md](todo-interactive-sudoku-tutor.md) - BACKLOG-015, future
  - Archived resolved todos: [todo-hidden-singles-implementation.md](todo-hidden-singles-implementation.md), [todo-audit-trail-feature.md](todo-audit-trail-feature.md), [todo-rest-api-wrapper.md](todo-rest-api-wrapper.md), [todo-web-ui-solver-visualisation.md](todo-web-ui-solver-visualisation.md)

### Document Types (Future)

As the project grows, additional planning documents may include:

- **SPRINT_PLAN_[date].md** - Sprint-specific planning documents
  - Sprint goals
  - Committed backlog items
  - Team capacity
  - Sprint retrospective notes

- **ROADMAP_[year].md** - High-level project roadmap
  - Quarterly milestones
  - Major feature releases
  - Strategic initiatives
  - Long-term vision

- **MILESTONE_[name].md** - Milestone tracking
  - Release criteria
  - Deliverables
  - Go/no-go decisions
  - Post-release retrospectives

## Using the Backlog

### For Project Leads

1. **Review Priorities:** Ensure backlog items align with project goals
2. **Sprint Planning:** Select items for upcoming sprint based on priorities and team capacity
3. **Stakeholder Updates:** Reference backlog for status reporting
4. **Dependency Management:** Track blockers and prerequisites

### For Developers

1. **Understand Work:** Read backlog item descriptions and acceptance criteria
2. **Estimate Effort:** Provide feedback on time estimates
3. **Update Status:** Mark items as in-progress or completed
4. **Report Blockers:** Flag dependencies or issues preventing progress

### For QA Engineers

1. **Test Planning:** Use acceptance criteria to create test cases
2. **Regression Testing:** Verify completed items don't break existing functionality
3. **Quality Metrics:** Track test coverage and defect rates

### For Stakeholders

1. **Visibility:** See what's being worked on and what's planned
2. **Prioritization Input:** Suggest priority changes or new features
3. **Progress Tracking:** Monitor velocity and burndown charts

## Backlog Workflow

### 1. Backlog Refinement (Weekly)

**Participants:** Project Lead, Development Team, QA

**Activities:**
- Review new items from code reviews, user feedback, or design documents
- Clarify requirements and acceptance criteria
- Estimate effort for upcoming items
- Identify dependencies and blockers
- Prioritize items (High/Medium/Low)

### 2. Sprint Planning (Every 2 weeks)

**Participants:** Development Team

**Activities:**
- Review sprint goal
- Select items from backlog based on priority and capacity
- Break down large items into smaller tasks
- Commit to sprint backlog
- Update item status to "In Progress"

### 3. Daily Standups (Daily)

**Participants:** Development Team

**Activities:**
- Review items in progress
- Report blockers or dependencies
- Update estimates if needed
- Move completed items to "Done"

### 4. Sprint Review (End of sprint)

**Participants:** Development Team, Stakeholders

**Activities:**
- Demo completed items
- Verify acceptance criteria met
- Mark items as completed (🟢)
- Move incomplete items back to backlog or next sprint

### 5. Sprint Retrospective (End of sprint)

**Participants:** Development Team

**Activities:**
- Review velocity and burndown
- Discuss what went well, what didn't
- Refine estimates based on actual effort
- Identify process improvements
- Update backlog with lessons learned

## Backlog Item Structure

Each backlog item follows this template:

```markdown
#### BACKLOG-XXX: Item Title
**Priority:** HIGH | MEDIUM | LOW
**Estimate:** X-Y hours
**Risk Reference:** [Link to code review or design doc]
**Status:** 🔴 Not Started | 🟡 In Progress | 🟢 Completed | ⏸️ Blocked
**Sprint:** X

**Description:**
Brief description of the work item.

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Dependencies:**
- BACKLOG-YYY (prerequisite item)

**Files to Create/Modify:**
- path/to/file1.ts
- path/to/file2.md
```

## Integration with Other Processes

### From Code Reviews → Backlog

**When:** After comprehensive code review
**Process:**
1. Code review identifies risks, issues, and recommendations
2. Create backlog items for each actionable finding
3. Reference code review document in backlog item
4. Prioritize based on risk severity

**Example:** Code Review (2026-01-30) identified Risk 1 (Incomplete Hidden Singles) → Created BACKLOG-001

### From Design Documents → Backlog

**When:** After design document approved
**Process:**
1. Design document outlines feature implementation
2. Create backlog item(s) for implementation
3. Reference design document for requirements
4. Use design's implementation plan for acceptance criteria

**Example:** audit-trail-feature.md (v1.0, Approved) → Created BACKLOG-008

### From Backlog → Implementation Logs

**When:** During/after implementation of backlog item
**Process:**
1. Start backlog item, mark as "In Progress"
2. Document implementation in implementation log
3. Reference backlog item in log
4. Update backlog item status to "Completed" when done

**Example:** BACKLOG-001 implemented → Document in IMPL_LOG_2026-02-05_Hidden_Singles_Fix.md

### From Backlog → Testing

**When:** During test planning and execution
**Process:**
1. QA reviews backlog item acceptance criteria
2. Create test scenarios based on criteria
3. Execute tests and verify all criteria met
4. Mark acceptance criteria checkboxes as completed

## Status Tracking

### Status Indicators

| Icon | Status | When to Use |
|------|--------|-------------|
| 🔴 | Not Started | Item in backlog, not yet assigned to sprint |
| 🟡 | In Progress | Actively being worked on in current sprint |
| 🟢 | Completed | All acceptance criteria met, verified, and merged |
| ⏸️ | Blocked | Cannot proceed due to dependencies or external factors |
| 📋 | Planned | Future work, not prioritized yet |
| 💡 | Idea | Concept stage, needs design or feasibility study |

### Priority Definitions

**HIGH Priority:**
- Critical for project success
- Blocks other high-value work
- Fixes specification gaps or critical bugs
- Required for milestone delivery

**MEDIUM Priority:**
- Important for quality and maintainability
- Enables future features
- Improves developer experience
- Reduces technical debt

**LOW Priority:**
- Nice-to-have improvements
- Optimization (performance, memory)
- Convenience features
- Cosmetic changes

## Estimation Guidelines

Use these ranges as guidelines:

| Estimate | Type of Work | Examples |
|----------|--------------|----------|
| 1-4 hours | Simple changes | Configuration, documentation, simple refactoring |
| 4-8 hours | Moderate features | New method, test addition, minor feature |
| 8-16 hours | Complex features | Multi-file changes, integration work, complex algorithm |
| 16-40 hours | Major features | Design + implementation + testing, significant refactoring |
| 40+ hours | Epics | Multi-sprint work, new implementations, cross-cutting changes |

**Note:** Estimates include design, implementation, testing, documentation, and code review time.

## Metrics and Reporting

### Velocity Tracking

**Definition:** Story points (or hours) completed per sprint

**How to Calculate:**
1. Sum estimates of all completed items in sprint
2. Track over multiple sprints
3. Use average velocity for sprint planning

**Example:** Sprint 1 completed 24 hours of work → Velocity = 24 hrs/sprint

### Burndown Chart

**Definition:** Remaining work vs. time

**How to Create:**
1. Plot total backlog hours on Y-axis
2. Plot sprint days on X-axis
3. Update daily with remaining work
4. Compare actual vs. ideal burndown

### Completion Rate

**Definition:** Percentage of committed items completed per sprint

**How to Calculate:**
```
Completion Rate = (Completed Items / Committed Items) × 100%
```

**Target:** >80% completion rate indicates good sprint planning

## Best Practices

### Do's

✅ **Keep backlog groomed** - Review and update weekly
✅ **Write clear acceptance criteria** - Testable, specific, measurable
✅ **Estimate collaboratively** - Involve developers, QA, and stakeholders
✅ **Track dependencies** - Identify blockers early
✅ **Reference source documents** - Link to code reviews, designs, issues
✅ **Update status regularly** - Keep backlog current (daily)
✅ **Break down large items** - Split items >40 hours into smaller pieces
✅ **Document decisions** - Record why items were prioritized or deferred

### Don'ts

❌ **Don't let backlog grow unbounded** - Archive low-priority items periodically
❌ **Don't commit to unclear items** - Refine before sprint planning
❌ **Don't ignore dependencies** - Address blockers proactively
❌ **Don't skip retrospectives** - Learn and improve continuously
❌ **Don't hide blockers** - Communicate issues immediately
❌ **Don't cherry-pick easy items** - Balance quick wins with high-priority work

## Backlog Maintenance Schedule

### Weekly (Monday)

- **Backlog Refinement:** 1 hour session
  - Review new items from previous week
  - Clarify requirements for next sprint candidates
  - Update estimates and priorities
  - Identify dependencies

### Bi-Weekly (Sprint Boundaries)

- **Sprint Planning:** 2 hour session (start of sprint)
  - Review sprint goal
  - Select and commit items
  - Break down tasks

- **Sprint Review & Retrospective:** 2 hour session (end of sprint)
  - Demo completed work
  - Update backlog status
  - Refine estimates
  - Document lessons learned

### Monthly

- **Backlog Health Check:** 30 minutes
  - Archive completed items older than 30 days
  - Review items stuck in "Blocked" status
  - Update long-term priorities
  - Generate velocity and completion metrics

## Questions or Feedback?

- **Backlog Questions:** Check this README for workflow and guidelines
- **New Backlog Items:** Create from code reviews, design docs, or user feedback
- **Priority Disputes:** Escalate to Project Lead for resolution
- **Process Improvements:** Suggest during sprint retrospectives

---

**Directory Owner:** Project Lead / Development Team
**Last Updated:** 2026-01-30
