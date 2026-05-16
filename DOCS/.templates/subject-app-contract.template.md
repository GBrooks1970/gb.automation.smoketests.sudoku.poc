# TEMPLATE — Subject Application Contract

**Intended audience:** Engineers implementing or testing the subject application; architects verifying surface compliance.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `REFERENCE_ARCHITECTURE.md` §6, §10.3
**Produces:** `DOCS/.architecture/subject-app-contract.md`

---

## How to Use This Template

- Author this document when a Stack's surface type is decided (RA §11, Phase 3).
- The subject application MUST satisfy every MUST requirement for its surface type before tests are written.
- If a requirement cannot be met, record it in `DECISION_REGISTER.md` with a justified deviation.

---

```markdown
# Subject Application Contract

**Last updated:** YYYY-MM-DD [REQUIRED]
**Subject application:** [Name and brief description] [REQUIRED]

---

## 1. Surface Type Inventory [REQUIRED]

| Stack | Surface | Entry point | Notes |
|-------|---------|-------------|-------|
| [STACK_NAME] | [@util / @cli / @api / @ui] | [path or URL] | [e.g. in-process class testing] |

---

## 2. @util Surface Contract (if applicable)

A `@util` surface tests logic in-process without spawning a live subject application.

| Requirement | Status | Notes |
|-------------|--------|-------|
| Subject application classes importable directly | [✅ / ❌] | [e.g. TypeScript source imported via ts-node] |
| All public methods are deterministic for given inputs | [✅ / ❌] | [Evidence] |
| No global mutable state shared between test scenarios | [✅ / ❌] | [How isolation is achieved] |
| Each scenario creates fresh instances | [✅ / ❌] | [Via Actor Memory reset] |

---

## 3. @cli Surface Contract (if applicable)

| Requirement (RA §6.3) | Status | Notes |
|-----------------------|--------|-------|
| Invokable as single command | [✅ / ❌] | [Command] |
| Documented argument/option interface | [✅ / ❌] | [--help output or link] |
| Exit code 0 for success, non-zero for failure | [✅ / ❌] | [Exit code map] |
| Human-readable output to stdout | [✅ / ❌] | [Format description] |
| Error detail to stderr | [✅ / ❌] | [How errors are routed] |
| Deterministic output for given inputs | [✅ / ❌] | [Confirmed by test suite] |
| Documented time bound | [✅ / ❌] | [Max expected duration] |

---

## 4. @api Surface Contract (if applicable)

| Requirement (RA §6.1) | Status | Notes |
|-----------------------|--------|-------|
| Health-check endpoint | [✅ / ❌] | [URL and expected response] |
| Structured responses (JSON/XML) | [✅ / ❌] | [Format] |
| Meaningful status codes | [✅ / ❌] | [Status code map] |
| Correlation ID propagation | [✅ / ❌] | [Header name] |
| Discoverable contract (OpenAPI/Swagger) | [✅ / ❌] | [URL or file path] |

---

## 5. @ui Surface Contract (if applicable)

| Requirement (RA §6.2) | Status | Notes |
|-----------------------|--------|-------|
| Stable, configurable entry point | [✅ / ❌] | [URL or launch command] |
| Observable state via DOM/accessibility tree | [✅ / ❌] | [Tool used] |
| Interactive controls drivable without mouse coordinates | [✅ / ❌] | [Confirmed] |
| Deterministic ready state detectable | [✅ / ❌] | [How detected] |
| Clean state between scenarios | [✅ / ❌] | [Reset mechanism] |

---

## 6. Known Gaps

| Requirement | Gap | Mitigation / Deferred to |
|-------------|-----|-------------------------|
| [Requirement] | [What is missing] | [DR-NNN or backlog item] |

---

## 7. Compliance Sign-Off

| Item | Verified by | Date |
|------|-------------|------|
| Surface contract satisfied | [Name / AI / Review] | YYYY-MM-DD |
| Gaps recorded in DECISION_REGISTER.md | [Name / AI] | YYYY-MM-DD |
```
