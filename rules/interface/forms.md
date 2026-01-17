# Interface: Forms

Source references:
- Vercel Design – Web Interface Guidelines: https://vercel.com/design/guidelines
- Web Interface Guidelines: https://github.com/vercel-labs/web-interface-guidelines

## Behavior
- MUST: Hydration-safe inputs (no lost focus/value)
- NEVER: Block paste in `<input>/<textarea>`
- MUST: Loading buttons show spinner and keep original label
- MUST: Enter submits focused text input. In `<textarea>`, ⌘/Ctrl+Enter submits; Enter adds newline
- MUST: Keep submit enabled until request starts; then disable, show spinner, use idempotency key
- MUST: Don't block typing; accept free text and validate after
- MUST: Allow submitting incomplete forms to surface validation
- MUST: Errors inline next to fields; on submit, focus first error
- MUST: `autocomplete` + meaningful `name`; correct `type` and `inputmode`
- SHOULD: Disable spellcheck for emails/codes/usernames
- SHOULD: Placeholders end with ellipsis and show example pattern (e.g., `+1 (123) 456-7890`, `sk-012345…`)
- MUST: Warn on unsaved changes before navigation
- MUST: Compatible with password managers & 2FA; allow pasting one-time codes
- MUST: Trim values to handle text expansion trailing spaces
- MUST: No dead zones on checkboxes/radios; label+control share one generous hit target

## Autofocus
- SHOULD: Autofocus on desktop when there's a single primary input; rarely on mobile (to avoid layout shift)
