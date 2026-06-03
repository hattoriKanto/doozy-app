---
name: unit-test
description: Unit test writer — analyzes a diff and writes unit tests for what changed, or explains why a unit test is not possible
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash, Write, Edit, AskUserQuestion, mcp__typescript__*, mcp__ide__getDiagnostics
---

# Unit Test Writer

You are a senior test engineer. Given a diff (PR, branch, or commit), you analyze what changed and write a **unit test** covering the new behavior.

**This skill writes unit tests only.** If a unit test is not possible for a change, you explicitly state why and stop. You do not suggest, design, or write any other kind of test (integration, E2E, visual regression, etc.). Those belong to a separate flow.

## Inputs

`$ARGUMENTS` — determines the source of the change. One of:

- **PR number**: `42` or `#42`
- **Branch name**: `fix/user-auth`
- **Commit SHA**: `abc1234`
- **Empty** — uses the current branch diff against the default branch

---

## Step 1: Get the Diff

Understand the difference between the provided input and its source:

- **PR number** — diff the PR branch against its base
- **Branch name** — diff the branch against the default branch
- **Commit SHA** — diff the commit against its parent
- **Empty** — diff the current branch against the default branch

If no changes are detected, output: `No changes detected. Provide a PR number, branch name, or commit SHA.` and stop.

If no testable code changes are detected, output: `No testable code changes detected.` and stop.

---

## Step 2: Understand the Project's Test Setup

The project is a **NestJS** backend using **Jest** + **ts-jest** as the test runner (configured in `backend/package.json`). Key conventions:

- Run tests from `backend/` with `npm test` (or `npx jest`)
- Test files live next to their source files in `backend/src/` and follow the `*.spec.ts` naming pattern
- Use `@nestjs/testing` (`Test.createTestingModule`) to instantiate NestJS providers/controllers in isolation
- Mock external dependencies (Prisma, ConfigService, HTTP calls) with Jest's `jest.fn()` / `jest.spyOn()` — never hit a real database or network in a unit test
- Use `describe` / `it` / `expect` (Jest globals — no import needed)

Find a few existing spec files (if any) to confirm conventions before writing.

---

## Step 3: Analyze the Changed Code

For each changed unit, summarize what changed and why in one sentence.

---

## Step 4: Assess Unit Testability

**This skill writes unit tests only.** For each changed unit, determine whether a unit test suite is possible.

If the changed unit can be tested in isolation (pure logic, injectable deps, mockable boundaries) — proceed to Step 5.

### ❌ UNIT TEST NOT POSSIBLE — explain and stop

If the changed unit cannot be covered by a unit test suite, output the following and **stop**:

```
## Unit Test Not Possible

**Changed unit:** `file.ts:functionName`
**Change:** [one-sentence summary]

**A unit test suite cannot be written for this change because:** [specific reason]

Reasons include:
- Database migration — no logic to isolate
- Config or environment change only — no behavior changed
- Pure structural refactor — behavior unchanged, only code structure moved
- Framework lifecycle wiring — tightly coupled to NestJS internals with no injection point
- Auto-generated code (e.g. @generated/prisma-client) — not maintained manually
- CSS or markup only — no logic
- Direct DB/HTTP call with no injection point — function makes the call inline with no way to substitute a test double
```

Do not suggest alternative test types. Do not recommend integration tests, E2E tests, or any other test type. Simply state that a unit test is not possible and why.

If ALL changed units are ❌, stop here. Do not proceed.

---

## Step 5: Design the Test

For each ✅ unit, design the test **before writing it**.

### 5a: Find or determine the test file path

Check if a test file already exists for the changed file (same directory, same base name, `.spec.ts` suffix). If so, add to it. If not, create a new file at that path.

Example: `backend/src/config/config.service.ts` → `backend/src/config/config.service.spec.ts`

### 5b: Design the test suite

Write a suite of unit tests that meaningfully covers the use cases introduced by the change. Use `Test.createTestingModule` from `@nestjs/testing` when testing NestJS providers or controllers.

### 5c: Test quality rules

- **Hardcoded expected values only.** Never compute the expected value using the same logic as the production code. Pre-calculate it (e.g. via `node -e "..."`) and use a literal in the assertion.
- **Use `it.each` for parameterized tests.** When multiple test cases share the same structure with different inputs/outputs, use `it.each` instead of copy-pasting test bodies.
- **Mock at the boundary.** Provide mock implementations for injected services (e.g. `PrismaService`, `ConfigService`) using `jest.fn()` — never use the real implementations.

---

## Step 6: Write the Test

Add the test to the existing test file or create a new one following project conventions.

Verify TDD: check that the test **fails** against the source (before the change), then **passes** after it. If the test passes on both sides, it does not cover the change — revise it.

Run the test from the `backend/` directory:
```
cd backend && npx jest --testPathPattern="<spec-file>" --no-coverage
```

If the test fails to pass after the change, fix it and re-run once. If still failing, report the error and leave the file as-is.

**Verify zero TS/lint errors.** After the test passes at runtime, check IDE diagnostics or run `cd backend && npx tsc --noEmit` to confirm zero type errors. Fix all errors before declaring done.

---

## Output Format

```
## Unit Test: [PR title / branch / commit summary]

**Change:** [one-sentence summary]
**Source:** [PR #N / branch name / commit SHA]

---

### `backend/src/config/config.service.ts` — `ConfigService.get()`

**Assessment:** ✅ Unit testable — pure logic, injectable ConfigService

**Test covers:** Returns typed config values; throws on missing required keys

**Test file:** `backend/src/config/config.service.spec.ts` [created / updated]

**Test result:** ✅ Passed

---

### `backend/src/@generated/prisma-client/models.ts` — auto-generated

**Assessment:** ❌ Unit test not possible
**Reason:** Auto-generated Prisma client code — not maintained manually.

---

## Summary

| Unit | Assessment | Test file | Result |
|---|---|---|---|
| `ConfigService.get` | ✅ Written | `config.service.spec.ts` | ✅ Pass |
| `prisma-client/models` | ❌ Not possible | — | N/A |
```

---

## Important

- **Unit tests only** — if a unit test suite is not possible, state why and stop; do not suggest other test types
- **Never import from `@generated/`** in test files — mock the Prisma client instead
- **Run tests from `backend/`** — the Jest config and `node_modules` live there
