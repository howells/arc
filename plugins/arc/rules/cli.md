# CLI Design

Rules for project CLIs that expose the API for local development and coding agent use.

## Philosophy

- MUST: Every project with an API ships a companion CLI.
- MUST: Dual-mode — scripted (with args) and interactive (no args).
- MUST: Use Commander for argument parsing in scripted mode.
- SHOULD: Use Ink (React TUI) for interactive mode in React projects.

## Scripted Mode

- SHOULD: `--quiet` flag to suppress non-essential output.
- SHOULD: Short aliases for common flags (`-m` for `--model`, `-o` for `--output`).

## Interactive Mode

- MUST: Screen-based navigation (Home screen routes to feature screens).
- MUST: Keyboard shortcuts documented in the UI (footer or header hints).
- SHOULD: Escape to go back, `q` to quit.
- SHOULD: State machine pattern for multi-step flows.

## Agent Friendliness

- MUST: `--json` outputs structured data, not decorated text.
- MUST: Errors in JSON mode use same structure as API errors. See [api.md](api.md).
- MUST: No color codes or spinners when stdout is not a TTY.
- SHOULD: `--help` output is complete and shows all options with examples.
- SHOULD: Support stdin piping for batch operations.

## Architecture

- MUST: API client shared between CLI and web app — same types, same logic.
- MUST: Separate argument parsing from interactive UI from business logic.
- SHOULD: Config hierarchy: env vars > global (`~/.tool/config.json`) > local (`.toolrc`).
