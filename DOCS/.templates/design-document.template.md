# TEMPLATE — Design Document

**Intended audience:** Engineers and architects designing a feature or component.
**Template version:** 1.0 (2026-05-17)
**Governed by:** `reference-architecture.md` §10.2
**Produces:** `DOCS/.design/[feature-name].md`

---

## How to Use This Template

- Copy this file. Do **not** edit it in place.
- Name the output file using kebab-case: `feature-name.md` (DR-020).
- Complete all sections. Sections with no applicable content should say "N/A — [reason]".
- Record structural decisions in `decision-register.md` and reference the DR number in Section 4.

---

# [Feature/Component Name] - Design Document

**Version:** v[X.Y]
**Date:** YYYY-MM-DDTHH:MM:SSZ
**Author:** [Name/Team]
**Reviewer:** [AI assistant (CLAUDE [model]) or human reviewer name]
**Status:** [Draft | In Review | Approved | Implemented | Deprecated]

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Analysis](#2-problem-analysis)
3. [Requirements](#3-requirements)
4. [Design Overview](#4-design-overview)
5. [Detailed Design](#5-detailed-design)
6. [Implementation Plan](#6-implementation-plan)
7. [Refactoring Strategy](#7-refactoring-strategy)
8. [Testing Strategy](#8-testing-strategy)
9. [Migration Path](#9-migration-path)
10. [Alternatives Considered](#10-alternatives-considered)
11. [Open Questions](#11-open-questions)
12. [Appendices](#12-appendices)

---

## 1. Executive Summary

### Purpose
[One-paragraph description of what this design addresses and why it matters]

### Scope
**In Scope:**
- [Feature/component 1]
- [Feature/component 2]
- [Feature/component 3]

**Out of Scope:**
- [Explicitly excluded item 1]
- [Explicitly excluded item 2]
- [Future consideration - not this phase]

### Key Decisions
1. **[Decision 1 Title]** - [Brief rationale]
2. **[Decision 2 Title]** - [Brief rationale]
3. **[Decision 3 Title]** - [Brief rationale]

### Success Criteria
- [Measurable criterion 1]
- [Measurable criterion 2]
- [Measurable criterion 3]

---

## 2. Problem Analysis

### Current State
[Describe the current situation, existing implementation, or problem being addressed]

**Current Architecture (if applicable):**
```
[Diagram or description of current state]
```

**Pain Points:**
1. **[Pain Point 1]** - [Description and impact]
2. **[Pain Point 2]** - [Description and impact]
3. **[Pain Point 3]** - [Description and impact]

### Root Cause Analysis
[Explain why the problem exists, not just what the problem is]

**Contributing Factors:**
- [Factor 1: Technical debt, design limitations, etc.]
- [Factor 2: Missing capabilities, performance issues, etc.]
- [Factor 3: User needs, business requirements, etc.]

### Constraints and Assumptions

**Technical Constraints:**
- [Constraint 1: Technology stack, platform limitations]
- [Constraint 2: Performance requirements, scalability needs]
- [Constraint 3: Integration requirements, API compatibility]

**Business Constraints:**
- [Constraint 1: Timeline, budget, resources]
- [Constraint 2: Regulatory, compliance, security]
- [Constraint 3: User expectations, SLA requirements]

**Assumptions:**
- [Assumption 1: User behavior, usage patterns]
- [Assumption 2: Technology availability, stability]
- [Assumption 3: Team capabilities, knowledge]

### Stakeholders
| Stakeholder | Role | Interest | Impact Level |
|-------------|------|----------|--------------|
| [Name/Group] | [Title] | [What they care about] | High/Medium/Low |
| [Name/Group] | [Title] | [What they care about] | High/Medium/Low |
| [Name/Group] | [Title] | [What they care about] | High/Medium/Low |

---

## 3. Requirements

### Functional Requirements

**FR-1: [Requirement Title]**
- **Description:** [What the system must do]
- **User Story:** As a [user type], I want to [action] so that [benefit]
- **Acceptance Criteria:**
  - Given [precondition]
  - When [action]
  - Then [expected outcome]
- **Priority:** Must Have | Should Have | Nice to Have

**FR-2: [Requirement Title]**
- **Description:** [What the system must do]
- **User Story:** As a [user type], I want to [action] so that [benefit]
- **Acceptance Criteria:**
  - Given [precondition]
  - When [action]
  - Then [expected outcome]
- **Priority:** Must Have | Should Have | Nice to Have

[Add FR-3, FR-4, etc. as needed]

### Non-Functional Requirements

**NFR-1: Performance**
- [Specific performance requirement with metrics]
- Example: Response time <200ms for 95th percentile

**NFR-2: Scalability**
- [Specific scalability requirement]
- Example: Support 10,000 concurrent users

**NFR-3: Reliability**
- [Specific reliability requirement]
- Example: 99.9% uptime SLA

**NFR-4: Security**
- [Specific security requirement]
- Example: All data encrypted at rest and in transit

**NFR-5: Maintainability**
- [Specific maintainability requirement]
- Example: Code coverage >80%, documented APIs

[Add NFR-6, NFR-7, etc. as needed]

### Requirements Traceability Matrix

| Requirement ID | Design Component | Test Case(s) | Status |
|----------------|------------------|--------------|--------|
| FR-1 | [Component name] | [Test ID] | Not Started |
| FR-2 | [Component name] | [Test ID] | Not Started |
| NFR-1 | [Component name] | [Test ID] | Not Started |

---

## 4. Design Overview

### High-Level Architecture

```
[Insert architecture diagram showing major components and their relationships]

Example:
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Component  │─────→│  Component  │─────→│  Component  │
│      A      │      │      B      │      │      C      │
└─────────────┘      └─────────────┘      └─────────────┘
```

**Description:**
[Explain the architecture diagram, component responsibilities, and data flow]

### Component Overview

| Component | Responsibility | Technology | Dependencies |
|-----------|---------------|------------|--------------|
| [Component A] | [What it does] | [Tech stack] | [Other components] |
| [Component B] | [What it does] | [Tech stack] | [Other components] |
| [Component C] | [What it does] | [Tech stack] | [Other components] |

### Data Flow

```
[Describe or diagram how data flows through the system]

1. [Step 1: Input/trigger]
2. [Step 2: Processing]
3. [Step 3: Storage/output]
```

### Technology Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Frontend | [Framework] | [X.Y] | [Why chosen] |
| Backend | [Framework] | [X.Y] | [Why chosen] |
| Database | [Database] | [X.Y] | [Why chosen] |
| Infrastructure | [Platform] | [X.Y] | [Why chosen] |

### Design Principles Applied

- **[Principle 1]:** [How it's applied in this design]
- **[Principle 2]:** [How it's applied in this design]
- **[Principle 3]:** [How it's applied in this design]

Examples: SOLID, KISS, YAGNI, DRY, Separation of Concerns

---

## 5. Detailed Design

### 5.1 Component A: [Name]

**Purpose:** [What this component does]

**Public Interface:**
```[language]
// Class/Interface definition
interface IComponentA {
    method1(param: Type): ReturnType;
    method2(param: Type): ReturnType;
}
```

**Internal Structure:**
```[language]
// Implementation details, key methods, data structures
class ComponentA implements IComponentA {
    private field1: Type;
    private field2: Type;

    public method1(param: Type): ReturnType {
        // Implementation logic
    }
}
```

**Dependencies:**
- [Dependency 1: Purpose]
- [Dependency 2: Purpose]

**State Management:**
- [How state is stored and managed]

**Error Handling:**
- [How errors are handled and propagated]

### 5.2 Component B: [Name]

[Follow same structure as Component A]

### 5.3 Data Model

**Entity: [EntityName]**
```[language]
interface Entity {
    id: string;              // Primary key
    field1: Type;            // Description
    field2: Type;            // Description
    createdAt: Date;         // Timestamp
    updatedAt: Date;         // Timestamp
}
```

**Relationships:**
```
[Describe entity relationships, cardinality, foreign keys]
```

**Data Validation:**
- [Field 1: Validation rules]
- [Field 2: Validation rules]

### 5.4 API Design (if applicable)

**Endpoint: [HTTP Method] /api/resource**

**Request:**
```json
{
    "field1": "value",
    "field2": "value"
}
```

**Response (Success - 200):**
```json
{
    "status": "success",
    "data": {
        "id": "123",
        "field1": "value"
    }
}
```

**Response (Error - 400):**
```json
{
    "status": "error",
    "message": "Validation failed",
    "errors": [
        {"field": "field1", "message": "Required"}
    ]
}
```

**Authentication:** [Required/Not Required, method]
**Rate Limiting:** [Limits if applicable]

### 5.5 Algorithm Design (if applicable)

**Algorithm: [AlgorithmName]**

**Pseudocode:**
```
FUNCTION algorithmName(input: Type) -> ReturnType:
    // Step 1: Initialize
    SET variable = initialValue

    // Step 2: Process
    FOR each item IN input:
        PERFORM operation

    // Step 3: Return
    RETURN result
```

**Complexity Analysis:**
- Time Complexity: O([complexity])
- Space Complexity: O([complexity])

**Edge Cases:**
- [Edge case 1: How handled]
- [Edge case 2: How handled]

---

## 6. Implementation Plan

### Phase 1: Foundation (Sprint [X])

**Goal:** [What this phase achieves]

**Tasks:**
1. **[Task 1.1]** - [Description]
   - Effort: [X hours/days]
   - Dependencies: None
   - Deliverable: [What's produced]

2. **[Task 1.2]** - [Description]
   - Effort: [X hours/days]
   - Dependencies: Task 1.1
   - Deliverable: [What's produced]

**Success Metrics:**
- [Metric 1: How to measure]
- [Metric 2: How to measure]

### Phase 2: Core Implementation (Sprint [Y])

**Goal:** [What this phase achieves]

**Tasks:**
[Follow same structure as Phase 1]

### Phase 3: Integration and Polish (Sprint [Z])

**Goal:** [What this phase achieves]

**Tasks:**
[Follow same structure as Phase 1]

### Risk Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [How to mitigate] |
| [Risk 2] | High/Med/Low | High/Med/Low | [How to mitigate] |

### Dependencies and Blockers

**External Dependencies:**
- [Dependency 1: What's needed, who provides, when]
- [Dependency 2: What's needed, who provides, when]

**Known Blockers:**
- [Blocker 1: What blocks progress, how to resolve]
- [Blocker 2: What blocks progress, how to resolve]

---

## 7. Refactoring Strategy

### Code to Refactor

**File: [path/to/file.ext]**
- **Reason:** [Why refactoring is needed]
- **Current State:** [Description or code snippet]
- **Desired State:** [What it should become]
- **Breaking Changes:** Yes/No - [Details if yes]

### Refactoring Steps

**Step 1: [Refactoring Title]**
1. [Action 1]
2. [Action 2]
3. [Action 3]
- **Verification:** [How to confirm success]
- **Rollback Plan:** [How to undo if needed]

**Step 2: [Refactoring Title]**
[Follow same structure]

### Backward Compatibility

**Deprecation Strategy:**
- [Deprecated feature 1: Timeline for removal]
- [Deprecated feature 2: Timeline for removal]

**Migration Path for Users:**
1. [Step 1 for users to migrate]
2. [Step 2 for users to migrate]
3. [Step 3 for users to migrate]

### Technical Debt Impact

**Debt Addressed:**
- [Technical debt item 1: How this design fixes it]
- [Technical debt item 2: How this design fixes it]

**New Debt Introduced:**
- [New debt item 1: Why acceptable, plan to address]
- [New debt item 2: Why acceptable, plan to address]

---

## 8. Testing Strategy

### Unit Testing

**Components to Test:**
- [Component A: Test coverage target 80%]
- [Component B: Test coverage target 80%]

**Test Cases:**
```[language]
describe('ComponentA', () => {
    test('should [expected behavior]', () => {
        // Arrange
        const input = [test data];

        // Act
        const result = componentA.method(input);

        // Assert
        expect(result).toBe([expected value]);
    });
});
```

### Integration Testing

**Integration Points:**
- [Component A ↔ Component B: Test interaction]
- [Component B ↔ External API: Test integration]

**Test Scenarios:**
1. [Scenario 1: Happy path integration]
2. [Scenario 2: Error handling integration]
3. [Scenario 3: Edge case integration]

### End-to-End Testing

**User Workflows:**
```gherkin
Scenario: [Workflow name]
  Given [precondition]
  When [user action]
  Then [expected outcome]
  And [additional verification]
```

### Performance Testing

**Load Testing:**
- [Scenario 1: X concurrent users, Y requests/sec]
- [Scenario 2: Peak load conditions]

**Stress Testing:**
- [Breaking point: How much load until failure]
- [Recovery: System behavior after stress]

**Benchmarks:**
| Operation | Current Baseline | Target | Max Acceptable |
|-----------|------------------|--------|----------------|
| [Operation 1] | [X ms] | [Y ms] | [Z ms] |

### Test Automation

**Tools:**
- Unit: [Framework name]
- Integration: [Framework name]
- E2E: [Framework name]

**CI/CD Integration:**
- [When tests run: On commit, on PR, nightly]
- [Failure policy: Block merge, notify team]

---

## 9. Migration Path

### Pre-Migration Checklist

- [ ] Backup current state
- [ ] Test rollback procedure
- [ ] Notify stakeholders
- [ ] Prepare monitoring/alerting
- [ ] Document manual steps

### Migration Steps

**Step 1: Preparation**
- [Action 1]
- [Action 2]
- **Duration:** [Estimated time]
- **Rollback Point:** [How to rollback if needed]

**Step 2: Execution**
- [Action 1]
- [Action 2]
- **Duration:** [Estimated time]
- **Rollback Point:** [How to rollback if needed]

**Step 3: Verification**
- [Verification 1]
- [Verification 2]
- **Duration:** [Estimated time]

**Step 4: Cleanup**
- [Cleanup 1: Remove old code/data]
- [Cleanup 2: Update documentation]
- **Duration:** [Estimated time]

### Rollback Plan

**Conditions for Rollback:**
- [Condition 1: Severity of issue triggering rollback]
- [Condition 2: Time limit - if not complete in X hours]

**Rollback Procedure:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Post-Migration Validation

**Smoke Tests:**
- [ ] [Critical path 1 works]
- [ ] [Critical path 2 works]
- [ ] [Critical path 3 works]

**Monitoring:**
- [Metric 1 to monitor for X hours/days]
- [Metric 2 to monitor for X hours/days]

---

## 10. Alternatives Considered

### Alternative 1: [Approach Name]

**Description:** [How this alternative would work]

**Pros:**
- [Advantage 1]
- [Advantage 2]

**Cons:**
- [Disadvantage 1]
- [Disadvantage 2]

**Reason for Rejection:** [Why not chosen]

### Alternative 2: [Approach Name]

[Follow same structure as Alternative 1]

### Alternative 3: [Approach Name]

[Follow same structure as Alternative 1]

### Comparison Matrix

| Criterion | Chosen Design | Alternative 1 | Alternative 2 |
|-----------|---------------|---------------|---------------|
| Complexity | [Rating] | [Rating] | [Rating] |
| Performance | [Rating] | [Rating] | [Rating] |
| Maintainability | [Rating] | [Rating] | [Rating] |
| Time to Implement | [Rating] | [Rating] | [Rating] |
| Risk Level | [Rating] | [Rating] | [Rating] |

---

## 11. Open Questions

### Technical Questions

**Q1: [Question]**
- **Impact:** High/Medium/Low
- **Blocking:** Yes/No
- **Who Can Answer:** [Person/Team]
- **Deadline:** [Date]
- **Current Status:** [Open/In Progress/Resolved]

**Q2: [Question]**
[Follow same structure]

### Business Questions

**Q1: [Question]**
[Follow same structure as technical questions]

### Resolved Questions

**Q1: [Question]**
- **Answer:** [Resolution]
- **Resolved By:** [Name]
- **Resolved Date:** YYYY-MM-DD
- **Impact on Design:** [How answer affected design]

---

## 12. Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| [Term 1] | [Definition] |
| [Term 2] | [Definition] |

### Appendix B: References

1. [Reference 1: Title, URL, Date accessed]
2. [Reference 2: Title, URL, Date accessed]
3. [Related Design Document: Path or link]

### Appendix C: Related Documents

- [Specification: Link]
- [Implementation Log: Link]
- [Code Review: Link]
- [API Documentation: Link]

### Appendix D: Diagrams

[Additional detailed diagrams that don't fit in main sections]

### Appendix E: Code Examples

```[language]
// Example 1: [Description]
[Code snippet]

// Example 2: [Description]
[Code snippet]
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v0.1 | YYYY-MM-DD | [Name] | Initial draft |
| v0.2 | YYYY-MM-DD | [Name] | Incorporated feedback from [reviewer] |
| v1.0 | YYYY-MM-DD | [Name] | Approved for implementation |
| v1.1 | YYYY-MM-DD | [Name] | Updated based on implementation learnings |

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Technical Lead | [Name] | [Signature/Email approval] | YYYY-MM-DD |
| Architect | [Name] | [Signature/Email approval] | YYYY-MM-DD |
| Product Owner | [Name] | [Signature/Email approval] | YYYY-MM-DD |

---

*End of Design Document*
