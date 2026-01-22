# Interface: Marketing Pages

**Quality bar:** Build marketing sites worthy of [siteinspire.com](https://siteinspire.com). Distinctive, refined, memorable — not generic template work.

## Animation

- SHOULD: Marketing animations can be longer than product UI
- NEVER: Scroll-triggered animations (fade-up, translate-Y on scroll)
- NEVER: Parallax, scroll hijacking, auto-advancing carousels
- SHOULD: Skip intro animation if seen this session:

```jsx
useEffect(() => {
  if (sessionStorage.getItem('introSeen')) return setSkipIntro(true);
  sessionStorage.setItem('introSeen', 'true');
}, []);
```

## CTAs

- MUST: Vary CTA by auth state:

| State | CTA |
|-------|-----|
| Logged out | "Get Started" / "Sign Up" |
| Logged in | "Go to Dashboard" / "Open App" |

## Navigation

- MUST: Submenu content in DOM even when hidden (SEO/a11y)

```html
<nav>
  <button aria-expanded="false">Products</button>
  <div class="submenu" aria-hidden="true"><!-- content here --></div>
</nav>
```

## Docs

- MUST: Copy button on all code snippets
- SHOULD: Support `.md` URL extension for markdown export
- SHOULD: Visual examples alongside code

## Blog/Changelog

- MUST: RSS feeds at `/blog/rss.xml`, `/changelog/rss.xml`
- SHOULD: `text-wrap: balance` on headings

## Illustrations

- SHOULD: `aria-label` on code-based illustrations
- SHOULD: `user-select: none; pointer-events: none` on decorative

## Performance

- MUST: Static generation for blog/docs/changelog (not request-time fetch)
- SHOULD: Preload above-fold images and fonts
