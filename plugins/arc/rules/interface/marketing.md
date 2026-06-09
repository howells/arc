# Interface: Marketing Pages

**Quality bar:** Build marketing sites worthy of [siteinspire.com](https://siteinspire.com). Distinctive, refined, memorable — not generic template work.

## Hero Section

The hero is the first impression. It sets the tone for everything below.

- MUST: Headline communicates the core value proposition in one sentence
- SHOULD: Typography creates drama — large size contrast between headline and subtext
- SHOULD: One primary CTA, visually dominant. Secondary CTA (if present) clearly subordinate.
- NEVER: Generic stock imagery that could belong to any product
- NEVER: More than 2 CTAs in the hero
- NEVER: Auto-playing video without user consent

**Hero patterns (pick one, don't combine):**

| Pattern | When to use |
|---------|-------------|
| Text-centered | Strong copy, no product to show yet |
| Split (text + visual) | Product screenshot, illustration, or demo |
| Full-bleed media | Photography-driven, lifestyle brands |
| Interactive/demo | Product speaks for itself |

## Section Composition

Marketing pages are narratives. Each section advances the story.

- MUST: Consistent vertical rhythm between sections (pick a value: 96px, 128px, or 160px and commit)
- SHOULD: Alternate visual weight — dense section followed by spacious, text followed by visual
- SHOULD: Each section has one clear purpose (don't combine testimonials with feature lists)
- SHOULD: Visual transitions between sections — background color shifts, not just whitespace
- NEVER: Cookie-cutter repeating layout (3-column cards, 3-column cards, 3-column cards)
- NEVER: More than 7-8 sections total (if you need more, you're not editing)

**Section rhythm matters more than individual section design.** A page with 5 well-paced sections beats a page with 10 beautifully designed sections that feel relentless.

## Social Proof

Social proof converts. But generic social proof repels.

- SHOULD: Real names, real photos, real companies — not "John D., CEO"
- SHOULD: Specific outcomes over vague praise ("Cut deploy time from 45min to 2min" > "Great product!")
- SHOULD: Logo bars with recognizable brands, monochrome, consistent sizing
- SHOULD: Testimonials placed after the claim they support (feature section → proof of that feature)
- NEVER: Fake or obviously AI-generated testimonials
- NEVER: Star ratings without context (everyone has 5 stars)
- NEVER: Carousel of testimonials that auto-advances (let users read at their pace)

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
