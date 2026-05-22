#!/usr/bin/env python3
"""Rank likely god files and exact duplicate blocks in JS/TS codebases."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from collections import defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

SOURCE_EXTENSIONS = {".cjs", ".cts", ".js", ".jsx", ".mjs", ".mts", ".ts", ".tsx"}

IGNORED_DIRS = {
    ".git",
    ".mastra",
    ".next",
    ".nuxt",
    ".output",
    ".turbo",
    ".vercel",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
    "storybook-static",
}

IGNORED_FILE_SUFFIXES = (
    ".d.ts",
    ".generated.ts",
    ".generated.tsx",
    ".gen.ts",
    ".gen.tsx",
    ".snap",
    ".stories.ts",
    ".stories.tsx",
)

TEST_SUFFIXES = (".spec.ts", ".spec.tsx", ".test.ts", ".test.tsx")

FUNCTION_RE = re.compile(
    r"\b(?:async\s+)?function\s+[A-Za-z0-9_$]+\s*\(|"
    r"\b(?:const|let|var)\s+[A-Za-z0-9_$]+(?:\s*:\s*[^=]+)?\s*=\s*(?:async\s*)?\([^)]*\)(?:\s*:\s*[^=]+)?\s*=>|"
    r"\b(?:const|let|var)\s+[A-Za-z0-9_$]+(?:\s*:\s*[^=]+)?\s*=\s*(?:async\s*)?[A-Za-z0-9_$]+(?:\s*:\s*[^=]+)?\s*=>"
)

COMPONENT_RE = re.compile(
    r"\b(?:export\s+)?function\s+[A-Z][A-Za-z0-9_$]*\s*\(|"
    r"\b(?:export\s+)?const\s+[A-Z][A-Za-z0-9_$]*(?:\s*:\s*[^=]+)?\s*=\s*(?:\([^)]*\)|[A-Za-z0-9_$]+)(?:\s*:\s*[^=]+)?\s*=>"
)

IMPORT_RE = re.compile(r"^\s*import\b|^\s*const\s+.*\s*=\s*require\(", re.MULTILINE)
EXPORT_RE = re.compile(r"^\s*export\b", re.MULTILINE)

RESPONSIBILITY_PATTERNS = {
    "ui": (r"<[A-Z_a-z][A-Za-z0-9_.:-]*(\s|>|/>)", r"\bclassName\s*="),
    "react-state": (r"\buse(State|Reducer|Effect|Memo|Callback|Ref)\b",),
    "forms-validation": (r"\bz\.object\b", r"\buseForm\b", r"\bvalidate\b", r"\bvalidation\b"),
    "network": (r"\bfetch\s*\(", r"\baxios\b", r"\bky\.", r"\btrpc\b", r"\bapi\b"),
    "database": (r"\bdrizzle\b", r"\bdb\.", r"\bselect\(", r"\binsert\(", r"\bupdate\("),
    "filesystem": (r"\bfs\.", r"node:fs", r"\breadFile", r"\bwriteFile"),
    "process-cli": (r"\bprocess\.argv\b", r"\bcommander\b", r"\byargs\b", r"\bprocess\.exit\b"),
    "routing": (r"\buseRouter\b", r"\bredirect\(", r"\bparams\b", r"\bsearchParams\b"),
    "testing": (r"\bdescribe\(", r"\bit\(", r"\btest\(", r"\bexpect\("),
}


@dataclass(frozen=True)
class FileMetrics:
    path: str
    category: str
    score: int
    lines: int
    nonblank_lines: int
    imports: int
    exports: int
    functions: int
    components: int
    responsibilities: list[str]
    reasons: list[str]


def should_ignore_file(path: Path, *, include_tests: bool) -> bool:
    name = path.name
    if any(name.endswith(suffix) for suffix in IGNORED_FILE_SUFFIXES):
        return True
    return not include_tests and any(name.endswith(suffix) for suffix in TEST_SUFFIXES)


def iter_source_files(root: Path, *, include_tests: bool) -> list[Path]:
    files: list[Path] = []
    for current_root, dirnames, filenames in os.walk(root):
        dirnames[:] = [name for name in dirnames if name not in IGNORED_DIRS]
        current = Path(current_root)
        for filename in filenames:
            path = current / filename
            if path.suffix in SOURCE_EXTENSIONS and not should_ignore_file(path, include_tests=include_tests):
                files.append(path)
    return sorted(files)


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="ignore")


def relative(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def detect_category(path: Path, content: str) -> str:
    rel = path.as_posix()
    if "/scripts/" in rel or "/bin/" in rel or path.name.startswith(("script-", "migrate-", "seed-")):
        return "script"
    if path.suffix in {".tsx", ".jsx"} or COMPONENT_RE.search(content):
        return "component"
    if path.name.endswith(TEST_SUFFIXES):
        return "test"
    return "module"


def detect_responsibilities(content: str) -> list[str]:
    detected = []
    for name, patterns in RESPONSIBILITY_PATTERNS.items():
        if any(re.search(pattern, content) for pattern in patterns):
            detected.append(name)
    return detected


def file_metrics(path: Path, root: Path) -> FileMetrics:
    content = read_text(path)
    lines = content.splitlines()
    nonblank_lines = [line for line in lines if line.strip()]
    imports = len(IMPORT_RE.findall(content))
    exports = len(EXPORT_RE.findall(content))
    functions = len(FUNCTION_RE.findall(content))
    components = len(COMPONENT_RE.findall(content))
    responsibilities = detect_responsibilities(content)
    category = detect_category(path, content)

    score = 0
    reasons: list[str] = []
    line_count = len(lines)

    if line_count >= 500:
        score += 60
        reasons.append(f"{line_count} lines")
    elif line_count >= 300:
        score += 35
        reasons.append(f"{line_count} lines")
    elif line_count >= 200:
        score += 20
        reasons.append(f"{line_count} lines")

    if functions >= 20:
        score += 35
        reasons.append(f"{functions} functions")
    elif functions >= 12:
        score += 20
        reasons.append(f"{functions} functions")
    elif functions >= 8:
        score += 10
        reasons.append(f"{functions} functions")

    if components >= 5:
        score += 30
        reasons.append(f"{components} components")
    elif components >= 3:
        score += 15
        reasons.append(f"{components} components")

    if len(responsibilities) >= 5:
        score += 35
        reasons.append(f"{len(responsibilities)} responsibility signals")
    elif len(responsibilities) >= 3:
        score += 18
        reasons.append(f"{len(responsibilities)} responsibility signals")

    if imports >= 25:
        score += 15
        reasons.append(f"{imports} imports")
    if exports >= 12:
        score += 15
        reasons.append(f"{exports} exports")
    if category == "component" and line_count >= 180 and components >= 2:
        score += 15
        reasons.append("large component file with nested components")
    if category == "script" and line_count >= 220 and len(responsibilities) >= 3:
        score += 15
        reasons.append("script mixes multiple concerns")

    return FileMetrics(
        path=relative(path, root),
        category=category,
        score=score,
        lines=line_count,
        nonblank_lines=len(nonblank_lines),
        imports=imports,
        exports=exports,
        functions=functions,
        components=components,
        responsibilities=responsibilities,
        reasons=reasons,
    )


def strip_line_comment(line: str) -> str:
    in_string = False
    quote = ""
    escaped = False
    for index, char in enumerate(line):
        next_char = line[index + 1] if index + 1 < len(line) else ""
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                in_string = False
            continue
        if char in {"'", '"', "`"}:
            in_string = True
            quote = char
            continue
        if char == "/" and next_char == "/":
            return line[:index].rstrip()
    return line


def normalize_line(line: str) -> str:
    stripped = strip_line_comment(line.strip())
    return re.sub(r"\s+", " ", stripped)


def is_meaningful_duplicate_line(line: str) -> bool:
    if not line:
        return False
    if re.match(r"^(import|export)\b", line):
        return False
    if re.match(r"^[{}()[\],.;:]+$", line):
        return False
    return len(line) >= 8


def duplicate_blocks(root: Path, window: int, *, include_tests: bool) -> list[dict[str, Any]]:
    occurrences: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for path in iter_source_files(root, include_tests=include_tests):
        raw_lines = read_text(path).splitlines()
        normalized = [normalize_line(line) for line in raw_lines]
        indexed = [(index + 1, line) for index, line in enumerate(normalized) if line]
        if len(indexed) < window:
            continue
        for offset in range(0, len(indexed) - window + 1):
            chunk = indexed[offset : offset + window]
            text = "\n".join(line for _, line in chunk)
            if len(text) < 120:
                continue
            meaningful_lines = [line for _, line in chunk if is_meaningful_duplicate_line(line)]
            if len(meaningful_lines) < max(3, window // 2):
                continue
            digest = hashlib.sha1(text.encode("utf-8")).hexdigest()
            occurrences[digest].append(
                {
                    "path": relative(path, root),
                    "start": chunk[0][0],
                    "end": chunk[-1][0],
                    "preview": meaningful_lines[0][:100],
                }
            )

    groups = []
    for matches in occurrences.values():
        unique_locations = {(match["path"], match["start"], match["end"]) for match in matches}
        unique_files = {match["path"] for match in matches}
        if len(unique_locations) < 2:
            continue
        groups.append(
            {
                "files": len(unique_files),
                "occurrences": len(unique_locations),
                "window": window,
                "matches": sorted(matches, key=lambda item: (item["path"], item["start"]))[:8],
            }
        )
    return sorted(groups, key=lambda item: (item["files"], item["occurrences"]), reverse=True)


def build_report(
    root: Path,
    min_score: int,
    duplicate_window: int,
    max_files: int,
    *,
    include_tests: bool,
) -> dict[str, Any]:
    metrics = [file_metrics(path, root) for path in iter_source_files(root, include_tests=include_tests)]
    candidates = [
        asdict(metric)
        for metric in sorted(metrics, key=lambda item: item.score, reverse=True)
        if metric.score >= min_score
    ][:max_files]
    duplicates = duplicate_blocks(root, duplicate_window, include_tests=include_tests)[:25]
    return {
        "root": str(root),
        "candidateCount": len(candidates),
        "duplicateGroupCount": len(duplicates),
        "includeTests": include_tests,
        "candidates": candidates,
        "duplicateBlocks": duplicates,
    }


def print_report(report: dict[str, Any]) -> None:
    print(f"Repo: {report['root']}")
    print(f"Likely god-file candidates: {report['candidateCount']}")
    for item in report["candidates"]:
        reasons = ", ".join(item["reasons"]) if item["reasons"] else "heuristic match"
        responsibilities = ", ".join(item["responsibilities"]) or "none"
        print(
            f"- score {item['score']:>3} [{item['category']}] {item['path']}: "
            f"{reasons}; responsibilities: {responsibilities}"
        )

    print(f"\nDuplicate block groups: {report['duplicateGroupCount']}")
    for group in report["duplicateBlocks"][:10]:
        print(
            f"- {group['occurrences']} occurrences across {group['files']} files "
            f"({group['window']}-line window)"
        )
        for match in group["matches"][:4]:
            print(f"  - {match['path']}:{match['start']} preview: {match['preview']}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Rank likely god components, god scripts, god modules, and duplicate JS/TS blocks.",
    )
    parser.add_argument("repo", nargs="?", default=".", help="Repository root to scan")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON")
    parser.add_argument("--min-score", type=int, default=35, help="Minimum candidate score")
    parser.add_argument("--max-files", type=int, default=40, help="Maximum candidates to print")
    parser.add_argument("--include-tests", action="store_true", help="Include test/spec files")
    parser.add_argument("--duplicate-window", type=int, default=9, help="Duplicate block window")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.repo).expanduser().resolve()
    if not root.exists():
        print(f"Path does not exist: {root}", file=sys.stderr)
        return 2
    report = build_report(
        root,
        args.min_score,
        args.duplicate_window,
        args.max_files,
        include_tests=args.include_tests,
    )
    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print_report(report)
    return 0


if __name__ == "__main__":
    sys.exit(main())
