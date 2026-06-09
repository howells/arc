# Interface: Forms

## Input Types

- MUST: Correct `type` for keyboard/validation: `email`, `tel`, `url`, `number`, `search`, `password`

## Input Attributes

- MUST: `autocomplete` + meaningful `name` for login/address forms
- SHOULD: `spellcheck="false"` for emails, codes, usernames
- SHOULD: `data-1p-ignore` to suppress password manager icons where unwanted

```html
<input type="text" spellcheck="false" autocomplete="off" data-1p-ignore />
```

## Input Decorations

- SHOULD: Position icons absolutely inside input with padding offset
- MUST: Clickable icons trigger input focus

```jsx
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
  <input className="pl-10 ..." />
</div>
```

## iOS

- MUST: `text-base` minimum on mobile inputs (16px prevents zoom on focus)

## Autofocus

- SHOULD: Autofocus primary input on desktop
- NEVER: Autofocus on touch devices (opens keyboard unexpectedly)

```jsx
<input autoFocus={!('ontouchstart' in window)} />
```

## Form Behavior

- MUST: Wrap inputs in `<form>` for Enter submission
- MUST: ⌘/Ctrl+Enter submits `<textarea>`; Enter adds newline
- MUST: Keep submit enabled until request starts, then disable + show spinner + keep original label
- MUST: Use idempotency keys on submit to prevent duplicate requests
- MUST: Accept free text input; validate after, don't block typing
- MUST: Allow submitting incomplete forms to surface validation errors
- MUST: Warn on unsaved changes before navigation
- MUST: Allow pasting (never block paste)
- MUST: Trim whitespace from values
- MUST: Hydration-safe inputs — no lost focus or value after hydration
- MUST: Compatible with password managers and 2FA; allow pasting one-time codes
- SHOULD: Prefill with user data when available
- SHOULD: Placeholder ends with ellipsis: `Search…`, `sk-012345…`

## Buttons

- MUST: Disable after submission to prevent duplicates
- SHOULD: Show keyboard shortcut in tooltip: `Save (⌘S)`
- SHOULD: `active:scale-[0.97]` for press feedback

```jsx
<button className="active:scale-[0.97] transition-transform">Submit</button>
```

## Checkboxes/Radios

- MUST: No dead zones — entire row clickable

```jsx
<label className="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" />
  <span>Remember me</span>
</label>
```

## Validation

- MUST: Use `aria-invalid` on invalid inputs

```jsx
<input aria-invalid={!!error} className={error ? "border-red-500" : ""} />
{error && <span className="text-sm text-red-500">{error}</span>}
```

## Destructive Actions

- MUST: Require confirmation (use `AlertDialog`, not `confirm()`)
