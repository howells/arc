---
name: duplicate-detector
description: |
  Use this agent to detect semantic code duplication - functions that do the same thing but have different names or implementations. Especially useful for codebases where new functions are often created rather than reusing existing ones.

  <example>
  Context: Before a major refactoring effort.
  user: "Find duplicate utility functions in the codebase"
  assistant: "I'll use the duplicate-detector agent to find semantic duplicates"
  <commentary>
  This agent detects functions that do the same thing but have different names, helping consolidate before refactoring.
  </commentary>
  </example>
---

# Duplicate Function Detector

Detect semantic code duplication - functions that do the same thing but have different names or implementations. Especially useful for codebases where new functions are often created rather than reusing existing ones.

## When to Use

- Codebase has grown organically with multiple contributors
- You suspect utility functions have been reimplemented multiple times
- Before major refactoring to identify consolidation opportunities
- After syntactic duplicate detection (jscpd) has been handled

## Process

```
1. Extract function catalog    → catalog.json
2. Categorize by domain        → categorized.json (haiku)
3. Split into categories       → categories/*.json
4. Find duplicates per category → duplicates/*.json (opus)
5. Generate report             → report.md
```

## Phase 1: Extract Function Catalog

```bash
./agents/research/duplicate-detector/extract-functions.sh src/ -o catalog.json
```

Options:
- `-o FILE`: Output file (default: stdout)
- `-c N`: Lines of context to capture (default: 15)
- `-t GLOB`: File types (default: `*.ts,*.tsx,*.js,*.jsx`)
- `--include-tests`: Include test files (excluded by default)

## Phase 2: Categorize by Domain

Dispatch a **haiku** subagent:

```
Read the function catalog at catalog.json and categorize each function.

Assign each function to exactly ONE category based on its primary purpose.

## Categories

- **file-ops**: Reading, writing, path manipulation, directory operations
- **string-utils**: Formatting, parsing, sanitization, case conversion, truncation
- **validation**: Input checking, schema validation, type guards, assertions
- **error-handling**: Error creation, wrapping, formatting, logging helpers
- **http-api**: Request building, response parsing, URL construction, headers
- **date-time**: Date formatting, parsing, comparison, timezone handling
- **data-transform**: Mapping, filtering, normalization, serialization
- **database**: Query building, connection management, migrations
- **logging**: Log formatting, debug helpers, telemetry
- **config**: Configuration loading, environment variables, settings
- **async-utils**: Promise helpers, retry logic, debounce, throttle
- **testing**: Test utilities, mocks, fixtures, assertions
- **ui-helpers**: DOM manipulation, event handling, component utilities
- **crypto**: Hashing, encryption, token generation
- **other**: Doesn't fit above categories (note subcategory in purpose)

## Output Format

For each function, output:
{"file": "...", "name": "...", "line": N, "category": "...", "purpose": "one sentence"}

Use the Write tool to save the complete JSON array to categorized.json.
```

## Phase 3: Split into Categories

```bash
./agents/research/duplicate-detector/prepare-category-analysis.sh categorized.json ./categories
```

Creates one JSON file per category. Only analyze categories with 3+ functions.

## Phase 4: Find Duplicates (Per Category)

For each category with 3+ functions, dispatch an **opus** subagent:

```
You are analyzing functions in the "{CATEGORY}" category for semantic duplicates.

Semantic duplicates are functions that serve the SAME PURPOSE even if:
- They have different names
- They use different implementations
- They have slightly different signatures
- One is more general than another

## Your Task

1. Compare all functions in this category
2. Identify groups of functions that do the same thing
3. For each duplicate group, assess confidence and recommend action

## Output Format

Return a JSON array of duplicate groups:

[
  {
    "intent": "<what these functions all do>",
    "confidence": "HIGH|MEDIUM|LOW",
    "functions": [
      {"file": "<path>", "name": "<name>", "line": <N>, "notes": "<specifics>"}
    ],
    "differences": "<how implementations differ>",
    "recommendation": {
      "action": "CONSOLIDATE|INVESTIGATE|KEEP_SEPARATE",
      "survivor": "<which function to keep>",
      "reason": "<why>"
    }
  }
]

## Confidence Levels

- **HIGH**: Definitely the same. Same input→output semantics.
- **MEDIUM**: Likely the same with minor differences.
- **LOW**: Possibly related, worth investigating.

## Recommendations

- **CONSOLIDATE**: Keep the one with better name/implementation/tests.
- **INVESTIGATE**: Need full implementations to decide. Flag for human review.
- **KEEP_SEPARATE**: Functions look similar but serve distinct purposes.

## Functions in "{CATEGORY}" Category

<INSERT_CATEGORY_JSON_HERE>
```

## Phase 5: Generate Report

```bash
./agents/research/duplicate-detector/generate-report.sh ./duplicates ./duplicates-report.md
```

Produces a prioritized markdown report grouped by confidence level.

## Phase 6: Human Review

Review the report. For HIGH confidence duplicates:
1. Verify the recommended survivor has tests
2. Update callers to use the survivor
3. Delete the duplicates
4. Run tests

## High-Risk Duplicate Zones

Focus extraction on these areas first:

| Zone | Common Duplicates |
|------|-------------------|
| `utils/`, `helpers/`, `lib/` | General utilities reimplemented |
| Validation code | Same checks written multiple ways |
| Error formatting | Error-to-string conversions |
| Path manipulation | Joining, resolving, normalizing paths |
| String formatting | Case conversion, truncation, escaping |
| Date formatting | Same formats implemented repeatedly |

## Common Mistakes

- **Extracting too much**: Focus on exported functions and public methods
- **Skipping categorization**: Going straight to duplicate detection produces noise
- **Using haiku for detection**: Use Opus for the actual duplicate analysis
- **Consolidating without tests**: Ensure the survivor has tests first
