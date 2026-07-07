#!/usr/bin/env python3
"""Build a read-only codebase map for Arc workflows.

The mapper is intentionally heuristic. It gives audit, refactor, and planning
workflows a shared orientation pass without turning scanner output into findings.
"""

from __future__ import annotations

import argparse
import json
import os
import re
from collections import Counter, defaultdict
from pathlib import Path


CODE_EXTS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".go", ".rs"}
JS_EXTS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}
SKIP_DIRS = {
    ".git",
    ".next",
    ".turbo",
    ".vercel",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
    "vendor",
}

SERVICE_PATTERNS = [
    ("Stripe", re.compile(r"from\s+['\"]stripe['\"]|require\(['\"]stripe['\"]\)", re.I)),
    ("OpenAI", re.compile(r"from\s+['\"]openai['\"]|require\(['\"]openai['\"]\)", re.I)),
    ("Anthropic", re.compile(r"@anthropic-ai|from\s+['\"]anthropic", re.I)),
    ("AWS", re.compile(r"@aws-sdk|aws-sdk", re.I)),
    ("Resend", re.compile(r"from\s+['\"]resend['\"]|require\(['\"]resend['\"]\)", re.I)),
    ("Supabase", re.compile(r"@supabase/", re.I)),
    ("Prisma", re.compile(r"@prisma/client", re.I)),
    ("Drizzle", re.compile(r"drizzle-orm", re.I)),
    ("Redis", re.compile(r"from\s+['\"](?:ioredis|redis)['\"]|require\(['\"](?:ioredis|redis)['\"]\)", re.I)),
]


def rel(root: Path, path: Path) -> str:
    return path.relative_to(root).as_posix()


def safe_read(path: Path, limit: int = 400_000) -> str:
    try:
        if path.stat().st_size > limit:
            return ""
        return path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""


def walk_code(root: Path) -> list[Path]:
    files: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        current = Path(dirpath)
        for filename in filenames:
            path = current / filename
            if path.suffix in CODE_EXTS:
                files.append(path)
    return sorted(files)


def read_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def package_manifests(root: Path) -> list[Path]:
    manifests: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(root):
        depth = len(Path(dirpath).relative_to(root).parts)
        if depth > 3:
            dirnames[:] = []
            continue
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        if "package.json" in filenames:
            manifests.append(Path(dirpath) / "package.json")
    return sorted(manifests)


def detect_project(root: Path) -> dict:
    packages = package_manifests(root)
    deps = {}
    for package_path in packages:
        package = read_json(package_path)
        for key in ("dependencies", "devDependencies"):
            deps.update(package.get(key, {}))

    framework = "Unknown"
    if "next" in deps:
        framework = "Next.js"
    elif "react" in deps:
        framework = "React"
    elif (root / "pyproject.toml").exists() or (root / "requirements.txt").exists():
        framework = "Python"
    elif (root / "go.mod").exists():
        framework = "Go"
    elif (root / "Cargo.toml").exists():
        framework = "Rust"

    package_manager = "unknown"
    for lockfile, name in (
        ("pnpm-lock.yaml", "pnpm"),
        ("yarn.lock", "yarn"),
        ("package-lock.json", "npm"),
        ("uv.lock", "uv"),
    ):
        if (root / lockfile).exists():
            package_manager = name
            break

    return {
        "framework": framework,
        "package_manager": package_manager,
        "has_package_json": bool(packages),
        "package_manifests": [rel(root, path) for path in packages[:20]],
        "dependency_count": len(deps),
    }


def detect_routes(root: Path, files: list[Path], texts: dict[Path, str]) -> list[dict]:
    routes: list[dict] = []
    app_route = re.compile(
        r"\b(?:app|router|server|fastify)\.(get|post|put|delete|patch|all)\s*\(\s*['\"]([^'\"]+)['\"]",
        re.I,
    )

    for path in files:
        if path.suffix not in JS_EXTS:
            continue
        text = texts[path]
        for match in app_route.finditer(text):
            line = text[: match.start()].count("\n") + 1
            routes.append(
                {
                    "method": match.group(1).upper(),
                    "path": match.group(2),
                    "file": rel(root, path),
                    "line": line,
                }
            )

        parts = path.parts
        if "app" in parts and "api" in parts and path.name in {"route.ts", "route.js"}:
            methods = re.findall(r"export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)", text)
            app_index = parts.index("app")
            route_path = "/" + "/".join(parts[app_index + 1 : -1])
            for method in methods:
                routes.append({"method": method, "path": route_path, "file": rel(root, path), "line": 1})

    return routes[:100]


def detect_schema(root: Path) -> dict:
    prisma = root / "prisma" / "schema.prisma"
    if prisma.exists():
        text = safe_read(prisma)
        models = re.findall(r"model\s+(\w+)\s*\{", text)
        provider = re.search(r"provider\s*=\s*['\"]([^'\"]+)['\"]", text)
        return {
            "orm": "prisma",
            "database": provider.group(1) if provider else "unknown",
            "tables": models[:80],
        }

    candidates = [root / "src/db/schema.ts", root / "db/schema.ts", root / "src/schema.ts"]
    for candidate in candidates:
        if not candidate.exists():
            continue
        text = safe_read(candidate)
        tables = re.findall(r"(?:pgTable|mysqlTable|sqliteTable)\s*\(\s*['\"](\w+)['\"]", text)
        if tables:
            return {"orm": "drizzle", "database": "detected", "tables": tables[:80]}

    return {"orm": "none", "database": "none", "tables": []}


def detect_services(root: Path, files: list[Path], texts: dict[Path, str]) -> list[dict]:
    found: dict[str, set[str]] = defaultdict(set)
    for path in files:
        if path.suffix not in JS_EXTS:
            continue
        text = texts[path]
        for name, pattern in SERVICE_PATTERNS:
            if pattern.search(text):
                found[name].add(rel(root, path))

    env_example = root / ".env.example"
    if env_example.exists():
        env_text = safe_read(env_example)
        if re.search(r"STRIPE_", env_text):
            found["Stripe"].add(".env.example")
        if re.search(r"OPENAI_|ANTHROPIC_", env_text):
            found["AI Provider"].add(".env.example")
        if re.search(r"REDIS_", env_text):
            found["Redis"].add(".env.example")

    return [{"name": name, "files": sorted(paths)[:8]} for name, paths in sorted(found.items())]


def resolve_import(root: Path, from_file: Path, specifier: str) -> str | None:
    if not specifier.startswith("."):
        return None
    base = (from_file.parent / specifier).resolve()
    for candidate in [base, *[base.with_suffix(ext) for ext in JS_EXTS]]:
        try:
            if candidate.exists() and candidate.is_file() and root in candidate.parents:
                return rel(root, candidate)
        except OSError:
            continue
    for ext in JS_EXTS:
        index = base / f"index{ext}"
        try:
            if index.exists() and root in index.parents:
                return rel(root, index)
        except OSError:
            continue
    return None


def import_graph(root: Path, files: list[Path], texts: dict[Path, str]) -> dict:
    graph: dict[str, list[str]] = {}
    imports = re.compile(r"(?:import\s+.*?\s+from\s+|require\()\s*['\"]([^'\"]+)['\"]", re.S)
    for path in files:
        if path.suffix not in JS_EXTS:
            continue
        key = rel(root, path)
        graph[key] = []
        for specifier in imports.findall(texts[path]):
            target = resolve_import(root, path, specifier)
            if target:
                graph[key].append(target)
    return graph


def find_cycles(graph: dict[str, list[str]], max_cycles: int = 20) -> list[list[str]]:
    cycles: list[list[str]] = []
    seen: set[tuple[str, ...]] = set()
    # Nodes proven acyclic (no path back to any ancestor). A node in a cycle is
    # always active during its own subtree walk, so it can never land here —
    # which makes skipping `safe` nodes sound while pruning repeated DFS work.
    safe: set[str] = set()

    def visit(node: str, stack: list[str], active: set[str]) -> bool:
        # Returns True when this subtree is cycle-entangled (reached an active
        # ancestor), meaning the node must not be memoized as safe.
        if len(cycles) >= max_cycles:
            return True
        if node in safe:
            return False
        if node in active:
            cycle = stack[stack.index(node) :] + [node]
            canonical = tuple(sorted(cycle[:-1]))
            if canonical not in seen:
                seen.add(canonical)
                cycles.append(cycle)
            return True
        if node not in graph:
            safe.add(node)
            return False
        active.add(node)
        stack.append(node)
        entangled = False
        for target in graph[node]:
            if visit(target, stack, active):
                entangled = True
        stack.pop()
        active.remove(node)
        if not entangled:
            safe.add(node)
        return entangled

    for node in graph:
        visit(node, [], set())
    return cycles


def summarize_imports(graph: dict[str, list[str]]) -> dict:
    fan_in = Counter()
    for targets in graph.values():
        fan_in.update(targets)
    fan_out = Counter({source: len(targets) for source, targets in graph.items()})
    return {
        "high_fan_in": [{"file": file, "count": count} for file, count in fan_in.most_common(12)],
        "high_fan_out": [{"file": file, "count": count} for file, count in fan_out.most_common(12) if count > 0],
    }


def source_summary(root: Path, files: list[Path], texts: dict[Path, str]) -> dict:
    by_ext = Counter(path.suffix or "<none>" for path in files)
    largest = []
    for path in files:
        text = texts[path]
        if not text:
            continue
        largest.append({"file": rel(root, path), "lines": text.count("\n") + 1})
    largest.sort(key=lambda item: item["lines"], reverse=True)
    return {"total_files": len(files), "by_extension": dict(sorted(by_ext.items())), "largest_files": largest[:20]}


def build_map(root: Path) -> dict:
    root = root.resolve()
    files = walk_code(root)
    # Read each source file exactly once and share the text across passes.
    texts = {path: safe_read(path) for path in files}
    graph = import_graph(root, files, texts)
    return {
        "root": str(root),
        "project": detect_project(root),
        "source": source_summary(root, files, texts),
        "routes": detect_routes(root, files, texts),
        "data": detect_schema(root),
        "services": detect_services(root, files, texts),
        "dependencies": {
            **summarize_imports(graph),
            "cycles": find_cycles(graph),
        },
    }


def markdown(data: dict) -> str:
    project = data["project"]
    source = data["source"]
    deps = data["dependencies"]
    lines = [
        "## Codebase Map",
        "",
        f"- **Framework:** {project['framework']}",
        f"- **Package manager:** {project['package_manager']}",
        f"- **Source files:** {source['total_files']}",
        f"- **Data layer:** {data['data']['orm']} ({data['data']['database']})",
        f"- **Services:** {', '.join(s['name'] for s in data['services']) or 'none detected'}",
        "",
        "### Largest Files",
    ]
    for item in source["largest_files"][:10]:
        lines.append(f"- `{item['file']}` — {item['lines']} LOC")
    if not source["largest_files"]:
        lines.append("- None")

    lines.extend(["", "### Routes"])
    for route in data["routes"][:20]:
        lines.append(f"- `{route['method']} {route['path']}` — `{route['file']}:{route['line']}`")
    if not data["routes"]:
        lines.append("- None detected")

    lines.extend(["", "### Data Tables"])
    for table in data["data"]["tables"][:20]:
        lines.append(f"- `{table}`")
    if not data["data"]["tables"]:
        lines.append("- None detected")

    lines.extend(["", "### Dependency Shape"])
    lines.append(f"- Import cycles: {len(deps['cycles'])}")
    for cycle in deps["cycles"][:5]:
        lines.append(f"  - {' -> '.join(cycle)}")
    lines.append("- High fan-in files:")
    for item in deps["high_fan_in"][:8]:
        lines.append(f"  - `{item['file']}` — {item['count']} importers")
    if not deps["high_fan_in"]:
        lines.append("  - None")

    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Build a read-only Arc codebase map.")
    parser.add_argument("path", nargs="?", default=".", help="Project path to scan")
    parser.add_argument("--format", choices=["json", "markdown"], default="markdown")
    args = parser.parse_args()

    root = Path(args.path)
    if not root.exists():
        if args.format == "markdown":
            print(f"## Codebase Map\n\nError: path not found: {root}")
        else:
            print(json.dumps({"error": f"Path not found: {root}", "success": False}, indent=2))
        return 1

    data = build_map(root)
    if args.format == "json":
        print(json.dumps(data, indent=2, sort_keys=True))
    else:
        print(markdown(data), end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
