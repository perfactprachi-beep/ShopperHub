# DESIGN SYSTEM — Shoppers Stop Clone
> Single source of truth for all UI decisions. Reference before building any component.

---

## 1. Brand Identity

| Property | Value |
|----------|-------|
| Brand Name | Shoppers Stop |
| Brand Character | Premium Indian fashion retail — trusted, aspirational, accessible |
| Target Audience | Urban Indian shoppers, 22–55, fashion-conscious |
| Tone | Elegant, warm, reliable |

---

## 2. Color Palette

### CSS Variables (add to `src/index.css` and `tailwind.config.js`)

```css
:root {
  /* Brand */
  --color-primary:       #8B1A2F;  /* Burgundy red — primary CTAs, logo */
  --color-primary-dark:  #6B1223;  /* Hover states */
  --color-primary-light: #F5E6E9;  /* Backgrounds, chips */

  /* Accent — First Citizen Gold */
  --color-accent:        #E8B04B;
  --color-accent-dark:   #C8942A;
  --color-accent-light:  #FDF3DC;

  /* Neutral */
  --color-secondary:     #1A1A1A;
  --color-text:          #1A1A1A;
  --color-muted:         #6B7280;
  --color-placeholder:   #9CA3AF;

  /* Surfaces */
  --color-bg:            #FAFAFA;
  --color-surface:       #FFFFFF;
  --color-surface-raised:#F3F4F6;

  /* Borders */
  --color-border:        #E5E5E5;
  --color-border-dark:   #D1D5DB;

  /* Semantic */
  --color-success:       #16A34A;
  --color-success-light: #DCFCE7;
  --color-error:         #DC2626;
  --color-error-light:   #FEE2E2;
  --color-warning:       #D97706;
  --color-warning-light: #FEF3C7;
  --color-info:          #2563EB;
  --color-info-light:    #DBEAFE;
}
```

### Tailwind Extension (`tailwind.config.js`)

```js
theme: {
  extend: {
    colors: {
      primary:  { DEFAULT: '#8B1A2F', dark: '#6B1223', light: '#F5E6E9' },
      accent:   { DEFAULT: '#E8B04B', dark: '#C8942A', light: '#FDF3DC' },
    }
  }
}
```

---

## 3. Typography

### Font Stack

```css
/* Google Fonts import in index.html */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

--font-heading: 'Playfair Display', Georgia, serif;
--font-body:    'DM Sans', system-ui, sans-serif;
```

### Type Scale

| Token | Size | Weight | Line-h | Usage |
|-------|------|--------|--------|-------|
| `text-hero` | 48px / 3rem | 700 | 1.1 | Hero banner headline |
| `text-h1` | 36px / 2.25rem | 700 | 1.2 | Page titles |
| `text-h2` | 28px / 1.75rem | 600 | 1.3 | Section headings |
| `text-h3` | 22px / 1.375rem | 600 | 1.4 | Card titles, sub-sections |
| `text-h4` | 18px / 1.125rem | 500 | 1.4 | Labels |
| `text-body` | 16px / 1rem | 400 | 1.6 | Body copy |
| `text-sm` | 14px / 0.875rem | 400 | 1.5 | Secondary text |
| `text-xs` | 12px / 0.75rem | 400 | 1.4 | Badges, captions |

**Rule:** All headings → `font-heading`. All body + UI text → `font-body`.

---

## 4. Spacing System

Base unit: `4px` (Tailwind default).

| Token | Value | Use |
|-------|-------|-----|
| `spacing-1` | 4px | Tight gaps (icon to label) |
| `spacing-2` | 8px | Inner padding (badge) |
| `spacing-3` | 12px | Small components |
| `spacing-4` | 16px | Standard padding |
| `spacing-6` | 24px | Card padding |
| `spacing-8` | 32px | Section inner |
| `spacing-12` | 48px | Section gap (mobile) |
| `spacing-16` | 64px | Section gap (desktop) |
| `spacing-24` | 96px | Hero padding |

---

## 5. Border Radius

```css
--radius-xs:   2px;    /* Tags, badges */
--radius-sm:   4px;    /* Inputs, small buttons */
--radius-md:   8px;    /* Cards, modals */
--radius-lg:   12px;   /* Drawers, panels */
--radius-xl:   16px;   /* Hero cards */
--radius-full: 9999px; /* Pills, avatar */
```

---

## 6. Shadows

```css
--shadow-sm:   0 1px 3px rgba(0,0,0,0.06);
--shadow-card: 0 2px 8px rgba(0,0,0,0.08);
--shadow-md:   0 4px 16px rgba(0,0,0,0.10);
--shadow-lg:   0 8px 32px rgba(0,0,0,0.12);
--shadow-xl:   0 16px 48px rgba(0,0,0,0.16);
```

---

## 7. Component Specs

### Button

| Variant | BG | Text | Border | Hover |
|---------|-----|------|--------|-------|
| Primary | `#8B1A2F` | White | — | `#6B1223` |
| Secondary | White | `#8B1A2F` | `#8B1A2F 1.5px` | `#F5E6E9` bg |
| Ghost | Transparent | `#1A1A1A` | `#E5E5E5 1px` | `#F3F4F6` bg |
| Danger | `#DC2626` | White | — | `#B91C1C` |
| Disabled | `#E5E5E5` | `#9CA3AF` | — | no change |

Sizes: `sm` (h-8 px-3 text-sm) · `md` (h-10 px-4 text-sm) · `lg` (h-12 px-6 text-base)

### ProductCard

```
┌──────────────────────┐
│  [Image 4:5 ratio]   │  ← position:relative
│  ♡  [SALE badge]    │  ← absolute top-right / top-left
├──────────────────────┤
│  Brand Name          │  ← text-xs muted uppercase
│  Product Title       │  ← text-sm font-medium 2-line clamp
│  ₹1,499  ₹2,499 40%│  ← price (bold) / MRP (line-through muted) / disc%
│  ⭐⭐⭐⭐ (4.2)      │  ← RatingStars xs
└──────────────────────┘
```

- Image aspect: `aspect-[4/5]`, `object-cover`
- Hover: card lifts with `shadow-md`, image scales `scale-105` (transition 300ms)
- Wishlist heart: outline default, filled red on active

### Navbar (Desktop)

```
[Logo]  [Search bar — full width]  [Wishlist ♡]  [Cart 🛒(2)]  [Account 👤]
─────────────────────────────────────────────────────────────────────────────
[Men]  [Women]  [Kids]  [Beauty]  [Home]  [Brands]  [Offers]
```

- Height: 64px top + 48px category bar = 112px total
- Sticky on scroll; category bar hides on scroll down, reappears on scroll up
- Mobile: hamburger collapses both bars into side drawer

### FilterSidebar

- Width: 260px (desktop), full-screen overlay (mobile)
- Sections (accordion): Categories · Brands · Price Range · Gender · Color · Rating · Discount
- Price: dual-thumb range slider (custom CSS)
- Color: 16px circle swatches with border on selected
- Apply / Clear buttons pinned to bottom

### CartDrawer

- Slide in from right, width: 420px (desktop), 100vw (mobile)
- Overlay: `rgba(0,0,0,0.4)` backdrop
- Items list → scrollable middle section
- Sticky bottom: subtotal + "Proceed to Checkout" button

---

## 8. Grid System

```
Mobile  (<768px):  1 col products, 2 col on /category
Tablet  (768px+):  2 col products
Desktop (1024px+): 4 col products (3 col with sidebar open)
Wide    (1280px+): max-width 1280px, centered, px-6 gutters
```

Tailwind classes to standardize:
```jsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
```

---

## 9. Iconography

Use **Lucide React** (`lucide-react`) — already in the React ecosystem.

| Icon | Usage |
|------|-------|
| `Heart` / `HeartFilled` | Wishlist |
| `ShoppingCart` | Cart |
| `Search` | Search bar |
| `User` | Account |
| `ChevronDown/Right` | Accordions, dropdowns |
| `Star` | Ratings |
| `Truck` | Shipping info |
| `RotateCcw` | Returns |
| `Shield` | Secure payment |
| `MapPin` | Address |
| `Bell` | Notifications |
| `X` | Close/dismiss |
| `Check` | Success |
| `AlertCircle` | Error |
| `Menu` | Hamburger |

Icon sizes: `16px` (inline text), `20px` (standard UI), `24px` (nav icons)

---

## 10. Animation Tokens

```css
--duration-fast:   150ms;
--duration-normal: 250ms;
--duration-slow:   400ms;
--ease-default:    cubic-bezier(0.4, 0, 0.2, 1);  /* ease-in-out */
--ease-out:        cubic-bezier(0, 0, 0.2, 1);
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);
```

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button hover | 150ms | ease-in-out |
| Drawer open/close | 300ms | ease-out |
| Toast appear | 250ms | spring |
| Carousel slide | 400ms | ease-in-out |
| Image zoom on card | 400ms | ease-in-out |
| Skeleton pulse | 1.5s | ease-in-out (loop) |

---

## 11. Breakpoints

```js
// tailwind.config.js (defaults — do not override)
screens: {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl': '1536px',
}
```

Mobile-first: write base styles for mobile, override upward with `md:`, `lg:`.

---

## 12. Admin Panel Design

- **Layout:** Fixed left sidebar (240px) + topbar (64px) + scrollable content area
- **Sidebar BG:** `#1A1A1A` (dark), active item highlight `#8B1A2F`
- **Content BG:** `#F3F4F6`
- **Cards:** White, `shadow-card`, `radius-md`, padding `24px`
- **Tables:** Striped rows (`#FAFAFA` alternating), sticky header
- **Charts:** Recharts `AreaChart` for revenue; `BarChart` for orders; brand color `#8B1A2F`

---

## 13. Accessibility Checklist

- [ ] All images have meaningful `alt` text
- [ ] Color contrast ratio ≥ 4.5:1 for normal text
- [ ] Focus rings visible on all interactive elements (`outline-2 outline-primary`)
- [ ] Modals trap focus (use `react-focus-trap` or native `dialog`)
- [ ] Buttons have aria-labels when icon-only
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages linked to inputs via `aria-describedby`
- [ ] Loading states announced via `aria-live="polite"`

---

*Last updated: —  |  Designer: —  |  Dev Owner: —*
