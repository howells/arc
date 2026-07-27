# Safety Net Templates

Output structures for `/arc:testing`. Bracketed values are placeholders to fill.

## Planning the safety net (Step 3)

```markdown
## Safety Net: [Target]

### Planned Change

- [Refactor / bug fix / migration / cleanup]

### Public Interfaces

- [Function/component/API route/page/CLI command]

### Current Observable Behavior

| Behavior   | Evidence                                       | Risk              |
| ---------- | ---------------------------------------------- | ----------------- |
| [behavior] | [code path, existing test, manual observation] | [high/medium/low] |

### Test Slices

| Slice          | Level                  | Why this level         |
| -------------- | ---------------------- | ---------------------- |
| [one behavior] | [unit/integration/e2e] | [fastest useful proof] |
```

## Reporting the result (Step 7)

```markdown
## Safety Net Result

**Target:** [code/feature]
**Reason:** [refactor/bug fix/legacy coverage/launch risk]
**Tests added:** [files]
**Behavior characterized:**

- [behavior]

**Verification:**

- [command] — [pass/fail]

**Remaining risk:**

- [untested behavior or reason it was deferred]

**Ready for next change:** [yes/no]
```
