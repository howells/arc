<overview>
ASCII UI wireframes force clear thinking about layout and flow. Create them during design, reference them during implementation.
</overview>

<box_drawing_characters>
**Basic box:**

```
┌───────────┐
│  content  │
└───────────┘
```

**With header:**

```
┌───────────┐
│  Header   │
├───────────┤
│  content  │
└───────────┘
```

**Nested boxes:**

```
┌─────────────────┐
│ ┌─────┐ ┌─────┐ │
│ │  A  │ │  B  │ │
│ └─────┘ └─────┘ │
└─────────────────┘
```

**Characters reference:**

- Corners: `┌ ┐ └ ┘`
- Lines: `─ │`
- Intersections: `├ ┤ ┬ ┴ ┼`
  </box_drawing_characters>

<common_patterns>
**Page layout:**

```
┌─────────────────────────────────────┐
│  Logo        [Search...]    [Menu]  │
├─────────────────────────────────────┤
│                                     │
│  [Main Content Area]                │
│                                     │
├─────────────────────────────────────┤
│  Footer                             │
└─────────────────────────────────────┘
```

**Card grid:**

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│ [image] │  │ [image] │  │ [image] │
├─────────┤  ├─────────┤  ├─────────┤
│ Title   │  │ Title   │  │ Title   │
│ $99.00  │  │ $49.00  │  │ $79.00  │
│ [Add]   │  │ [Add]   │  │ [Add]   │
└─────────┘  └─────────┘  └─────────┘
```

**Form:**

```
┌─────────────────────────────┐
│ Create Account              │
├─────────────────────────────┤
│ Email:                      │
│ [_______________________]   │
│                             │
│ Password:                   │
│ [_______________________]   │
│                             │
│ [  Create Account  ]        │
│                             │
│ Already have an account?    │
│ [Sign in]                   │
└─────────────────────────────┘
```

**Modal/Dialog:**

```
┌─────────────────────────────┐
│ Confirm Delete         [X]  │
├─────────────────────────────┤
│                             │
│ Are you sure you want to    │
│ delete this item?           │
│                             │
│ This action cannot be       │
│ undone.                     │
│                             │
│    [Cancel]  [Delete]       │
└─────────────────────────────┘
```

**Table:**

```
┌──────────┬─────────┬──────────┐
│ Name     │ Status  │ Actions  │
├──────────┼─────────┼──────────┤
│ Item 1   │ Active  │ [Edit]   │
│ Item 2   │ Pending │ [Edit]   │
│ Item 3   │ Done    │ [View]   │
└──────────┴─────────┴──────────┘
```

**Sidebar layout:**

```
┌────────┬────────────────────────┐
│ Nav    │                        │
│        │  Main Content          │
│ [Home] │                        │
│ [Dash] │  ┌──────────────────┐  │
│ [Set]  │  │  Inner Panel     │  │
│        │  └──────────────────┘  │
│        │                        │
└────────┴────────────────────────┘
```

**Tabs:**

```
┌──────┬──────┬──────┐
│ Tab1 │ Tab2 │ Tab3 │
├──────┴──────┴──────┴─────────────┐
│                                  │
│  Tab 1 Content                   │
│                                  │
└──────────────────────────────────┘
```

</common_patterns>

<interactive_elements>
**Buttons:**

- `[Button Label]` - primary action
- `[ Cancel ]` - secondary action (spaces for visual weight)
- `[X]` - close button

**Inputs:**

- `[_____________]` - text input
- `[v Select... v]` - dropdown
- `[x] Checkbox` - checked
- `[ ] Checkbox` - unchecked
- `(•) Radio` - selected
- `( ) Radio` - unselected

**States:**

- `[Button]` - default
- `[Button*]` - loading (asterisk)
- `[Button!]` - error state
- `[-Button-]` - disabled
  </interactive_elements>

<state_variations>
**Always design these states:**

**Empty state:**

```
┌─────────────────────────┐
│                         │
│    No items yet         │
│                         │
│    [Add First Item]     │
│                         │
└─────────────────────────┘
```

**Loading state:**

```
┌─────────────────────────┐
│                         │
│    Loading...           │
│    [====    ]           │
│                         │
└─────────────────────────┘
```

**Error state:**

```
┌─────────────────────────┐
│ ⚠ Error                 │
├─────────────────────────┤
│                         │
│ Something went wrong.   │
│                         │
│ [Try Again]  [Contact]  │
└─────────────────────────┘
```

</state_variations>

<mobile_vs_desktop>
**Show both when relevant:**

**Desktop:**

```
┌────────┬────────────────────────┐
│ Sidebar│   Main Content         │
│        │                        │
│ [Nav]  │   ┌────┐ ┌────┐ ┌────┐│
│ [Nav]  │   │Card│ │Card│ │Card││
│ [Nav]  │   └────┘ └────┘ └────┘│
└────────┴────────────────────────┘
```

**Mobile:**

```
┌──────────────────┐
│ [☰]  Logo  [👤]  │
├──────────────────┤
│                  │
│ ┌──────────────┐ │
│ │    Card      │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │    Card      │ │
│ └──────────────┘ │
│                  │
└──────────────────┘
```

</mobile_vs_desktop>
