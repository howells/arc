# Component Design Patterns

## When to Use Compound Components

| Scenario                      | Pattern      |
| ----------------------------- | ------------ |
| Multiple parts share state    | Compound     |
| Flexible child order/presence | Compound     |
| Slots (header/body/footer)    | Compound     |
| Fixed structure, 1-3 props    | Simple props |

```jsx
// Compound
<Dialog>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Title</Dialog.Title>
  </Dialog.Content>
</Dialog>

// Simple (fixed structure)
<Avatar src={url} fallback="JD" />
```

## API Design

### Props

- MUST: Consistent naming across components (`disabled`, not `isDisabled`)
- MUST: Positive boolean names (`disabled`, not `notEnabled`)
- MUST: Event handlers prefixed with `on` (`onChange`, `onOpenChange`)
- MUST: Spread `...props` to underlying element
- MUST: Accept ref as a prop (React 19 — no `forwardRef`)

```tsx
function Button({
  variant = "primary",
  size = "md",
  className,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={ref}
      className={cn(variants({ variant, size }), className)}
      {...props}
    />
  );
}
```

### Customization Layers

1. **Variants** — `variant="primary"`, `variant="destructive"`
2. **Sizes** — `size="sm"`, `size="md"`, `size="lg"`
3. **className** — Escape hatch for one-offs
4. **asChild** — Render as different element

## `asChild` Pattern

Render component behavior on a different element:

```jsx
import { Slot } from "@radix-ui/react-slot";

function Button({ asChild, ...props }) {
  const Comp = asChild ? Slot : "button";
  return <Comp {...props} />;
}

// Usage
<Button asChild>
  <Link href="/page">Click</Link>
</Button>;
```

## Controlled vs Uncontrolled

Support both:

```jsx
function Input({ value: controlled, defaultValue, onChange, ...props }) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : internal;

  return (
    <input
      value={value}
      onChange={(e) => {
        if (!isControlled) setInternal(e.target.value);
        onChange?.(e);
      }}
      {...props}
    />
  );
}
```

## Composition

Prefer composition over config objects:

```jsx
// Good
<Card>
  <CardHeader><CardTitle>Title</CardTitle></CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Avoid
<Card header={{ title: "Title" }} content="Content" />
```

## Defaults

- MUST: `type="button"` default (not `"submit"`)
- SHOULD: Defaults work for 80% of cases

## File Structure

```
components/
├── button/
│   ├── button.tsx
│   └── index.ts
├── card/
│   ├── card.tsx
│   ├── card-header.tsx
│   └── index.ts
```

## Anti-Patterns

| Anti-Pattern                                            | Fix                                                            |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| Prop explosion (`leftIcon`, `rightIcon`, `iconSize`...) | Use children: `<Button><Icon /> Text</Button>`                 |
| Boolean variants (`primary`, `large`, `rounded`)        | Explicit variants: `variant="primary" size="lg"`               |
| Duplicating an existing component with small changes    | Search the codebase first. Add a variant/prop to the original. |
| Creating without searching                              | Glob/Grep for similar components before writing any new one.   |
| `cloneElement` to inject props into children            | Use context, render props, or explicit composition             |
| `Children.map`/`forEach`/`count`/`toArray`              | Use explicit props or context — child traversal is fragile     |
| `forwardRef` wrapper                                    | Use ref-as-prop (React 19)                                     |
| Class components (`extends Component`)                  | Convert to function component with hooks                       |
| `defaultProps` on function components                   | Use JS default parameters                                      |
| `propTypes`                                             | Use TypeScript                                                 |

## Explicit Variants (over Boolean Props)

When a component grows boolean props (`isThread`, `isEditing`, `isCompact`), each boolean doubles the state space. Create explicit variant components instead:

```tsx
// ❌ Boolean explosion — 2³ = 8 possible states
<Composer isThread isDMThread isEditing />

// ✅ Explicit variants — each is a focused component
<ThreadComposer channelId="abc" />
<EditMessageComposer messageId="xyz" />
<ForwardMessageComposer messageId="123" />
```

Each variant can share logic via a common hook or provider, but the component surface is clear.

## Context Interface Pattern

For complex compound components, define a standard context shape with three parts:

```tsx
interface ComposerContextValue {
  state: ComposerState; // What data exists (value, attachments, mentions)
  actions: ComposerActions; // How to modify it (setValue, addAttachment, submit)
  meta: ComposerMeta; // Refs, config, readonly info (inputRef, maxLength)
}
```

This enables dependency injection — different providers can implement the same interface with completely different state management (local state, Zustand, URL params). Consumers don't care how state is managed, only what's available.
