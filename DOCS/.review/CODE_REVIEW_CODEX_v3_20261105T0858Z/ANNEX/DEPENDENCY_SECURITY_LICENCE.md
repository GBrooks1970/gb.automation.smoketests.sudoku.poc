# Dependency, Security and Licence Pass

[<- Back to Index](../00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](../00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md)

**Reviewer:** AI assistant (Codex GPT-6)

## Current Audit Evidence

| Scope | Result on 2026-11-05 |
| --- | --- |
| TypeScript full npm audit | 14 affected package records: 2 high, 12 moderate; exit 1 |
| TypeScript production-only npm audit | 2 affected package records: 1 high, 1 moderate; exit 1 |
| Governed Node audit | exit 1; expired 2026-10-12 exception; summary reports 11 normalised findings |
| NuGet, including transitive | no vulnerable packages reported; exit 0 |
| Python | initial auditor unavailable; follow-up audit status recorded below |

Package counts include npm's dependency propagation and must not be added to unique advisory counts. The governed evaluator's count uses a different normalised model. Saved JSON contains the actual advisory identifiers rather than invented CVEs.

The installed body-parser 2.3.0 is inside the affected range of [GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828); the 2.x patched version is 2.4.0. This runtime edge is discussed in S-01. [demo-apps/demoapp001-typescript-cypress/package-lock.json](../../../../demo-apps/demoapp001-typescript-cypress/package-lock.json) (line 1504); [demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts) (line 32). The full audit also reports follow-redirects and several moderate tooling findings; [demo-apps/demoapp001-typescript-cypress/package-lock.json](../../../../demo-apps/demoapp001-typescript-cypress/package-lock.json) (line 2600). Current audit output is stronger evidence of maintenance need than the old braces acceptance. No dependency is labelled abandoned without evidence, and no blanket 'latest version' upgrade is recommended.

## Lockfile and Reproducibility Assessment

The repository carries npm, Python test and NuGet lock inputs. C# locked restore succeeded. JavaScript validation reused installed dependencies in isolation; a fresh `npm ci` was not performed. Therefore this review does not certify clean-install reproducibility or that every installed JavaScript module exactly matches its lock. The production audit used `--package-lock-only` to inspect the committed dependency model directly.

## Input and Secret Boundaries

The demo API is unauthenticated and applies a JSON size limit, explicit grid checks and permissive CORS. These choices fit a controlled demonstration but are not an Internet-hardening claim. No live crash/exfiltration probe was run. The generator accepts bounded clue counts and a five-attempt cap; numeric seeds are a contract mismatch rather than an injection finding. [demo-apps/demoapp001-typescript-cypress/app_src/server/validation.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/server/validation.ts) (line 281); [demo-apps/demoapp001-typescript-cypress/app_src/generator/puzzle-generator-service.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/generator/puzzle-generator-service.ts) (line 6). The common solver tests need no external API token. A limited tracked-source secret-pattern scan is recorded in the final validation note; absence of a match cannot prove a clean history or entropy-based secret audit.

## Licence

The root licence is ISC and agrees with TypeScript metadata, Python metadata and C# package metadata. [LICENSE](../../../../LICENSE) (line 1); [demo-apps/demoapp001-typescript-cypress/package.json](../../../../demo-apps/demoapp001-typescript-cypress/package.json) (line 41). No project-licence inconsistency was found. Dependency manifests and audit metadata were inspected, but transitive notice redistribution and a formal compatibility/legal assessment were not performed.


## Final Python Audit Status

The original project interpreter lacked pip-audit. Version 2.10.1 was then installed in a uniquely named scratch venv and invoked against the project's installed site-packages with --path, --skip-editable and --format=json. It produced no audit result during the review and was stopped by matching only processes owned by that scratch interpreter. Python dependency security therefore remains unverified in this pass; no zero-finding result is claimed. The project environment was not modified.

---

[<- Previous](VALIDATION_AND_SCOPE.md) | [Back to Index](../00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](../00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md)
