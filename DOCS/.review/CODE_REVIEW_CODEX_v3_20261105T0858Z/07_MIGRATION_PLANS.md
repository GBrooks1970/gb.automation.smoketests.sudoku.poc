# Migration Strategy and Plans

[<- Back to Index](00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](ANNEX/VALIDATION_AND_SCOPE.md)

**Reviewer:** AI assistant (Codex GPT-6)

These are proposed bounded changes. They do not authorise implementation or alter accepted decisions.

## Single Source of Truth for Features

- Preserve the shared Gherkin location and native runner adapters.
- Select TRIAGE-15 explicitly before changing advanced Given semantics.
- Translate every supported coordinate/candidate argument into arrangement, or reject unsupported values clearly.
- Add one-variable wrong-Given controls independently of Then controls.
- Run all three BDD lanes and both source/result parity checks; retain changed-fixture evidence.
- Treat effort as local-to-moderate across three bindings; principal risk is changing an existing example's intended precondition.

## Docker Compose for Local Development

- Keep the current optional test/API/benchmark services; no new infrastructure is required by these findings. [docker-compose.yml](../../../docker-compose.yml) (line 3).
- Before any future image/build work, verify storage against `E:\_DockerData`.
- Pin and review dependency inputs in Docker builds as well as native runs.
- Keep runtime API and static Pages evidence distinct; a static-only publication has a smaller attack surface.
- Document which native CI gates Compose omits rather than calling it identical to CI.
- Effort is bounded configuration/documentation unless new product scope is chosen; no container run was used to claim acceptance here.

## GitHub Actions/Workflow

- Clear S-01 and S-02 before treating a newly triggered build as expected green.
- Add S-03 to native component tests and S-04 to parity-tool negative controls.
- Keep build/test permissions read-only and Pages credentials isolated to deployment. [.github/workflows/ci.yml](../../../.github/workflows/ci.yml) (line 374).
- Consider pinning Action SHAs during a dedicated maintenance change, with verification of supported revisions.
- Register this review in both shared indexes in a separately coordinated change; the user requested review isolation here.
- Run exact-commit CI after an authorised implementation PR. Local results in this review are not a substitute for remote CI or merge approval.

---

[<- Previous](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](ANNEX/VALIDATION_AND_SCOPE.md)
