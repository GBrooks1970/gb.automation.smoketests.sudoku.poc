# Tooling Directory — Test Framework Configuration

**Stack:** DEMOAPP001_TYPESCRIPT_CYPRESS

---

## Purpose

The `tooling/` directory holds test framework configuration files and utilities specific to this Stack's test runner. These files are **framework-owned** and remain in their native format, unchanged by the architecture.

## Principle: Framework-Owned Config Remains Native

This Stack uses Cucumber.js + Serenity/JS as its BDD test framework. The architectural layers (Screenplay, Tasks, Questions, Abilities) interact **above** the tooling layer. The tooling layer itself—including framework configuration, reporters, and test runner setup—remains:

- **In native format:** Configuration is written in the language and format the framework expects (JavaScript, YAML, JSON, etc.)
- **Not abstracted:** There is no Screenplay abstraction over Cucumber configuration; no translation layer
- **Owned by the framework team:** When the framework is updated, configuration may change without requiring architectural review
- **Documented for clarity:** Each tool's purpose and configuration is explained in this directory

This separation ensures that:
1. **Portability across Stacks:** A new Stack (e.g., Python + pytest-bdd) will have a different `tooling/` directory with different configuration, but the Screenplay layer above it remains identical
2. **Framework autonomy:** Test runner and reporter decisions can be made independently by Stack experts
3. **Clarity of boundaries:** The architecture controls what happens in Layers 1–3 (Feature files, Step Definitions, Screenplay); the framework owns Layer 4 (Ability implementations) and everything in `tooling/`

## Files in This Directory

| File | Purpose | Format | Ownership |
|------|---------|--------|-----------|
| `cucumber.js` | Cucumber configuration and test runner entry point | JavaScript (Node.js) | Cucumber.js + SerenityJS configuration |

## Configuration Files at Stack Root

The following configuration files are stored at the Stack root (not in `tooling/`) but are also framework-owned:

| File | Purpose | Language | Ownership |
|------|---------|----------|-----------|
| `package.json` | Node.js dependency manifest and script definitions | JSON | npm |
| `tsconfig.json` | TypeScript compiler configuration | JSON | TypeScript compiler |
| `tsconfig.cucumber.json` | TypeScript configuration for Cucumber runtime | JSON | TypeScript compiler + Cucumber |
| `cucumber.js` at root | Legacy entry point (now moved to `tooling/cucumber.js`) | JavaScript | Cucumber.js |
| `eslint.config.js` | Code linting configuration | JavaScript | ESLint |
| `.prettierrc` | Code formatting configuration | JSON | Prettier |

## Extending Tooling Configuration

When a new tool is needed for this Stack (e.g., a new reporter, a helper utility, a performance analyzer):

1. **Create the tool configuration file** in the `tooling/` directory (e.g., `tooling/performance-reporter.config.js`)
2. **Document it in this README** with its purpose, format, and ownership
3. **Ensure it does not abstract Screenplay components** — the tool operates on Layer 4 (Abilities) or Layer 5 (Subject Application), not on Task/Question logic
4. **Do not embed the tool configuration in the Screenplay layer** — tooling decisions remain local to this Stack

## Related Decision

Recorded in `decision-register.md` as **DR-015**: Architectural rule that framework-owned test runner and tooling configuration remains native to the framework, unmodified by Screenplay abstraction or cross-Stack normalization.

---

## Screenplay Above, Tooling Below

The Screenplay layer (layers 1–3: Features, Steps, Tasks, Questions) describes *what* the test does in business-intelligible terms. The tooling layer describes *how* to run and report on tests using a specific framework. Both layers can evolve independently:

```
Features & Steps & Screenplay (Layers 1–3) — Framework-agnostic
                 ↓
        Framework Tooling — Native to Cucumber.js, TypeScript
                 ↓
         Abilities & Subject App (Layers 4–5) — Subject-specific
```

This README documents the tooling layer for this Stack and explains why it remains framework-owned.
