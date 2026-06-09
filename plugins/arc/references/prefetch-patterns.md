# Prefetch Patterns Reference

Trajectory-based content loading strategies that reclaim 100–200ms by predicting user intent before hover.

---

## Trajectory Prefetching

Standard prefetching triggers on `mouseenter` — the cursor must reach the element before loading begins. Trajectory prefetching predicts where the cursor is heading and starts loading **before** hover.

### The Concept

```
Traditional:     cursor → [enters element] → fetch starts → content loads
                                              ↑ too late

Trajectory:      cursor → [enters hit slop zone] → fetch starts → [enters element] → content ready
                           ↑ 100-200ms earlier
```

### Hit Slop Zones

Define invisible detection zones around interactive elements. When the cursor enters the zone AND is moving toward the element, start prefetching.

```tsx
function usePrefetchOnTrajectory(
  ref: RefObject<HTMLElement>,
  prefetchFn: () => void,
  options?: { slopPx?: number }
) {
  const { slopPx = 40 } = options ?? {};
  const lastPos = useRef({ x: 0, y: 0 });
  const prefetched = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      if (prefetched.current) return;

      const rect = el.getBoundingClientRect();
      const expanded = {
        top: rect.top - slopPx,
        right: rect.right + slopPx,
        bottom: rect.bottom + slopPx,
        left: rect.left - slopPx,
      };

      const inSlop =
        e.clientX >= expanded.left &&
        e.clientX <= expanded.right &&
        e.clientY >= expanded.top &&
        e.clientY <= expanded.bottom;

      if (inSlop) {
        // Check trajectory — is cursor moving toward element?
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        const toCenterX = centerX - e.clientX;
        const toCenterY = centerY - e.clientY;

        // Dot product > 0 means moving toward center
        if (dx * toCenterX + dy * toCenterY > 0) {
          prefetched.current = true;
          prefetchFn();
        }
      }

      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    document.addEventListener("mousemove", handleMove, { passive: true });
    return () => document.removeEventListener("mousemove", handleMove);
  }, [ref, prefetchFn, slopPx]);
}
```

### Hit Slop Sizing

| Element Type     | Slop Size | Why                                          |
| ---------------- | --------- | -------------------------------------------- |
| Navigation links | 30–40px   | Dense layout, many targets                   |
| Cards/tiles      | 40–60px   | Larger spacing between items                 |
| CTA buttons      | 50–80px   | High-value targets worth aggressive prefetch |

---

## When to Prefetch

### DO Prefetch:

- **Navigation links** — route data, page shells
- **Expandable content** — accordion bodies, dropdown contents
- **Media thumbnails** — full-size images on hover intent
- **Next page** — in paginated lists, when cursor moves toward "Next"
- **Tabs** — content for the tab the cursor is heading toward

### DON'T Prefetch:

- **Everything** — wasted bandwidth, server load
- **Authenticated routes** — may trigger unnecessary auth checks
- **Heavy payloads** — large downloads, video streams
- **Mutations** — never prefetch POST/PUT/DELETE
- **Already cached data** — check cache before prefetching

---

## Keyboard Prefetch

Trajectory prefetching is mouse-only. For keyboard users, prefetch on `focus`:

```tsx
<Link href="/dashboard" onFocus={() => prefetchRoute("/dashboard")}>
  Dashboard
</Link>
```

For tab-based navigation:

```tsx
<Tab
  onFocus={() => prefetchTabContent(tabId)}
  onKeyDown={(e) => {
    // Arrow keys preview next/prev tab
    if (e.key === "ArrowRight") prefetchTabContent(nextTabId);
    if (e.key === "ArrowLeft") prefetchTabContent(prevTabId);
  }}
/>
```

---

## Touch Device Fallback

Touch devices don't have cursor trajectory. Alternatives:

| Technique             | How                                     | When                |
| --------------------- | --------------------------------------- | ------------------- |
| `touchstart` prefetch | Start loading on finger down            | Lists, navigation   |
| Viewport intersection | Prefetch when element scrolls into view | Below-fold content  |
| Idle prefetch         | Load during `requestIdleCallback`       | Critical next steps |

```tsx
// touchstart gives ~200ms head start over tap
<Link
  href="/page"
  onTouchStart={() => prefetchRoute("/page")}
>
```

---

## Next.js Integration

Next.js has built-in prefetching via `<Link>`. Trajectory prefetching extends it:

```tsx
import Link from "next/link";
import { useRouter } from "next/navigation";

function NavLink({ href, children }) {
  const router = useRouter();
  const ref = useRef<HTMLAnchorElement>(null);

  usePrefetchOnTrajectory(ref, () => router.prefetch(href));

  return (
    <Link ref={ref} href={href}>
      {children}
    </Link>
  );
}
```

**Note:** Next.js already prefetches `<Link>` on viewport intersection. Trajectory prefetching adds value for links NOT in the viewport (e.g., navigation menus that appear on hover).

---

## Performance Budget

- **Max concurrent prefetches:** 2–3 (don't saturate the connection)
- **Deduplicate:** Track what's been prefetched, don't repeat
- **Cancel on direction change:** If cursor veers away, abort the fetch
- **Respect `Save-Data` header:** Skip prefetching if the user has data saver enabled

```tsx
// Check data saver preference
const shouldPrefetch = !navigator.connection?.saveData;
```
