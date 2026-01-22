# Component Design Patterns

## When to Use Compound Components

| Scenario | Pattern |
|----------|---------|
| Multiple parts share state | Compound |
| Flexible child order/presence | Compound |
| Slots (header/body/footer) | Compound |
| Fixed structure, 1-3 props | Simple props |

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
- MUST: Forward refs

```jsx
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button ref={ref} className={cn(variants({ variant, size }), className)} {...props} />
  )
);
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
<Button asChild><Link href="/page">Click</Link></Button>
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

| Anti-Pattern | Fix |
|--------------|-----|
| Prop explosion (`leftIcon`, `rightIcon`, `iconSize`...) | Use children: `<Button><Icon /> Text</Button>` |
| Boolean variants (`primary`, `large`, `rounded`) | Explicit variants: `variant="primary" size="lg"` |
| Premature abstraction | Wait until you've copy-pasted 2-3 times |
