# TanStack Table v8 Reference

Quick reference for TanStack Table v8 performance patterns, TypeScript setup, and anti-patterns.

---

## Critical Rules

### The Two Stable Reference Rules

**MUST** have stable references for these two values, or you get infinite re-render loops:

```tsx
// CORRECT: Stable references
const columns = useMemo(
  () => [columnHelper.accessor("firstName", { header: "First Name" })],
  []
);

const [data, setData] = useState<Person[]>(initialData);

// Or with transformations
const processedData = useMemo(() => rawData.filter((d) => d.active), [rawData]);

const table = useReactTable({
  data: processedData,
  columns,
  getCoreRowModel: getCoreRowModel(),
});
```

```tsx
// WRONG: New array every render = infinite loops
function BadTable() {
  const columns = [columnHelper.accessor("name", { header: "Name" })]; // Creates new array every render!

  const data = sourceData.filter((d) => d.active); // Also new array!

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
}
```

### Always Include getCoreRowModel

```tsx
// WRONG: Missing required row model
const table = useReactTable({ data, columns });

// CORRECT
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
});
```

---

## Basic Setup

```bash
npm install @tanstack/react-table
```

```tsx
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
```

### Minimal Table

```tsx
type Person = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
};

const columnHelper = createColumnHelper<Person>();

const columns = useMemo(
  () => [
    columnHelper.accessor("firstName", { header: "First Name" }),
    columnHelper.accessor("lastName", { header: "Last Name" }),
    columnHelper.accessor("age", { header: "Age" }),
  ],
  []
);

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
});
```

### Render Pattern

```tsx
<table>
  <thead>
    {table.getHeaderGroups().map((headerGroup) => (
      <tr key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <th key={header.id}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </th>
        ))}
      </tr>
    ))}
  </thead>
  <tbody>
    {table.getRowModel().rows.map((row) => (
      <tr key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <td key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
```

---

## Row Models

Data flows through processing stages in order:

```
Data → Filtered → Grouped → Sorted → Expanded → Paginated → Final Rows
```

| Row Model                 | Purpose              | When to Use                         |
| ------------------------- | -------------------- | ----------------------------------- |
| `getCoreRowModel()`       | Basic 1:1 mapping    | Always required                     |
| `getFilteredRowModel()`   | Apply filters        | Client-side filtering               |
| `getSortedRowModel()`     | Apply sorting        | Client-side sorting                 |
| `getPaginationRowModel()` | Slice for pages      | Client-side pagination              |
| `getExpandedRowModel()`   | Show/hide sub-rows   | Expandable rows                     |
| `getGroupedRowModel()`    | Group hierarchically | Grouping (avoid for large datasets) |

---

## TypeScript Patterns

### Declaration Merging for Meta Types

**MUST** import before declare module:

```tsx
// types/tanstack-table.d.ts
import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
    align?: "left" | "center" | "right";
    editable?: boolean;
  }
}
```

### Using Extended Meta

```tsx
const columns = [
  columnHelper.accessor("firstName", {
    header: "First Name",
    meta: {
      className: "min-w-[150px]",
      editable: true,
    },
  }),
];

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  meta: {
    updateData: (rowIndex, columnId, value) => {
      setData((old) =>
        old.map((row, index) =>
          index === rowIndex ? { ...row, [columnId]: value } : row
        )
      );
    },
  },
});
```

---

## Performance

### Decision Matrix: Client vs Server

| Factor             | Client-Side | Server-Side     |
| ------------------ | ----------- | --------------- |
| Row count          | < 10,000    | > 10,000        |
| Data fetch cost    | Low         | High            |
| Filter complexity  | Simple      | Complex         |
| Memory constraints | None        | Browser limited |

### Virtualization for Large Datasets

**MUST** use virtualization for 10k+ rows:

```bash
npm install @tanstack/react-virtual
```

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualizedTable({ data, columns }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <table>
        <thead>{/* headers */}</thead>
        <tbody
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                style={{
                  position: "absolute",
                  transform: `translateY(${virtualRow.start}px)`,
                  height: `${virtualRow.size}px`,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

### Debounce Filter Inputs

```tsx
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce);
    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

---

## Anti-Patterns

### NEVER: Define components inside render

```tsx
// WRONG
function BadTable() {
  const CustomCell = ({ value }) => <span>{value}</span>; // Recreated every render!
  const columns = useMemo(
    () => [{ cell: (info) => <CustomCell value={info.getValue()} /> }],
    []
  );
}

// CORRECT: Define outside
const CustomCell = ({ value }) => <span>{value}</span>;

function GoodTable() {
  const columns = useMemo(
    () => [{ cell: (info) => <CustomCell value={info.getValue()} /> }],
    []
  );
}
```

### NEVER: Use memoMode

```tsx
// WRONG: Breaks virtualization and density toggles
const table = useReactTable({
  memoMode: "cells", // Don't use this
});
```

### NEVER: Grouping on large datasets

```tsx
// WRONG: Can cause 30-40 second renders on 50k rows
const table = useReactTable({
  data: largeDataset, // 50,000 rows
  getGroupedRowModel: getGroupedRowModel(),
});

// CORRECT: Use server-side grouping
const table = useReactTable({
  data: largeDataset,
  manualGrouping: true,
});
```

### NEVER: Hoist frequently-changing state

```tsx
// WRONG: Re-renders entire tree on every mouse move during resize
const [columnSizingInfo, setColumnSizingInfo] = useState({});

const table = useReactTable({
  state: { columnSizingInfo },
  onColumnSizingInfoChange: setColumnSizingInfo,
});

// CORRECT: Only control state you actually need
const table = useReactTable({
  enableColumnResizing: true,
  columnResizeMode: "onChange",
  // Don't control columnSizingInfo unless required
});
```

### NEVER: Forget to clean up row selection

```tsx
// Selection persists for deleted rows in v8 (v7 auto-reset)
useEffect(() => {
  const validRowIds = new Set(data.map((row) => row.id));
  setRowSelection((prev) => {
    const cleaned: RowSelectionState = {};
    Object.keys(prev).forEach((id) => {
      if (validRowIds.has(id)) cleaned[id] = true;
    });
    return cleaned;
  });
}, [data]);
```

---

## Common Patterns

### Sorting + Filtering + Pagination

```tsx
const [sorting, setSorting] = useState<SortingState>([]);
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: { sorting, columnFilters, pagination },
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onPaginationChange: setPagination,
});
```

### Server-Side Operations

```tsx
const table = useReactTable({
  data, // Pre-processed by server
  columns,
  getCoreRowModel: getCoreRowModel(),
  manualSorting: true,
  manualFiltering: true,
  manualPagination: true,
  pageCount: serverPageCount, // Total pages from server
  state: { sorting, columnFilters, pagination },
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onPaginationChange: setPagination,
});

// Fetch when state changes
useEffect(() => {
  fetchData({ sorting, columnFilters, pagination });
}, [sorting, columnFilters, pagination]);
```

### Inline Editing with Table Meta

```tsx
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  meta: {
    updateData: (rowIndex, columnId, value) => {
      setData((old) =>
        old.map((row, index) =>
          index === rowIndex ? { ...row, [columnId]: value } : row
        )
      );
    },
  },
});

// In cell component
function EditableCell({
  getValue,
  row,
  column,
  table,
}: CellContext<Person, string>) {
  const [value, setValue] = useState(getValue());

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value);
  };

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
    />
  );
}
```

---

## Quick Reference

### State Control Pattern

```tsx
// You MUST provide BOTH state.X AND onXChange for controlled state
const table = useReactTable({
  state: { sorting }, // Pass your state
  onSortingChange: setSorting, // Receive updates
});
```

### Useful Table Methods

```tsx
table.getState(); // All state
table.getRowModel().rows; // Final processed rows
table.getSelectedRowModel().rows; // Selected rows
table.getColumn("columnId"); // Specific column
table.getPageCount(); // Total pages
table.previousPage(); // Navigate
table.nextPage();
table.resetRowSelection(); // Clear selection
```

### Performance Checklist

- [ ] `columns` wrapped in `useMemo`
- [ ] `data` stable (useState or useMemo)
- [ ] Virtualization for 1000+ rows
- [ ] Debounce filter inputs (500ms)
- [ ] Server-side operations for 10k+ rows
- [ ] No `memoMode` options
- [ ] Cell components defined outside component
