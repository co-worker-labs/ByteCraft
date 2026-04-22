# Neon Precision Design System

> ByteCraft website full redesign — cyberpunk aesthetic, Tailwind CSS migration

## Overview

Replace the current Bootstrap 5 based design with a custom cyberpunk-themed design system using Tailwind CSS. The aesthetic is "Neon Precision" — dark-first with precise neon borders and glow effects, professional and restrained.

**Constraints:**

- No excessive animation, no flashy/cluttered visuals
- Usability first — this is a developer tools site
- Clear visual hierarchy and depth
- Dark mode is the primary experience; light mode is a "light cyber" variant

## Design Tokens

### Colors

#### Dark Mode (Primary)

| Token                | Value                   | Usage                              |
| -------------------- | ----------------------- | ---------------------------------- |
| `bg-base`            | `#0B0F1A`               | Page background                    |
| `bg-surface`         | `#111827`               | Cards, panels, header/footer       |
| `bg-elevated`        | `#1E293B`               | Popovers, dropdowns, table headers |
| `bg-input`           | `#0D1117`               | Input fields, textareas            |
| `fg-primary`         | `#F1F5F9`               | Primary text                       |
| `fg-secondary`       | `#94A3B8`               | Secondary text                     |
| `fg-muted`           | `#64748B`               | Muted/disabled text                |
| `accent-cyan`        | `#06D6A0`               | Primary brand color                |
| `accent-purple`      | `#8B5CF6`               | Secondary brand color              |
| `accent-cyan-dim`    | `rgba(6,214,160,0.15)`  | Subtle cyan backgrounds            |
| `accent-purple-dim`  | `rgba(139,92,246,0.15)` | Subtle purple backgrounds          |
| `success`            | `#10B981`               | Success states                     |
| `danger`             | `#EF4444`               | Error/danger states                |
| `warning`            | `#F59E0B`               | Warning states                     |
| `border-default`     | `#1E293B`               | Default borders                    |
| `border-subtle`      | `#334155`               | Subtle separators                  |
| `border-glow`        | `rgba(6,214,160,0.4)`   | Neon glow borders                  |
| `border-glow-strong` | `rgba(6,214,160,0.8)`   | Hover glow borders                 |

#### Light Mode

| Token            | Value     |
| ---------------- | --------- |
| `bg-base`        | `#F8FAFC` |
| `bg-surface`     | `#FFFFFF` |
| `bg-elevated`    | `#FFFFFF` |
| `bg-input`       | `#F1F5F9` |
| `fg-primary`     | `#0F172A` |
| `fg-secondary`   | `#475569` |
| `fg-muted`       | `#94A3B8` |
| `border-default` | `#E2E8F0` |

Accent colors remain the same. Glow effects are replaced with solid colored borders.

### Typography

| Role         | Font Family    | Source       |
| ------------ | -------------- | ------------ |
| Brand / Code | JetBrains Mono | Google Fonts |
| Body / UI    | Inter          | Google Fonts |

#### Font Scale

| Tailwind Class | Size     | Usage                |
| -------------- | -------- | -------------------- |
| `text-xs`      | 0.75rem  | Auxiliary info       |
| `text-sm`      | 0.875rem | Secondary text       |
| `text-base`    | 1rem     | Body text            |
| `text-lg`      | 1.125rem | Section subtitles    |
| `text-xl`      | 1.25rem  | Section titles       |
| `text-2xl`     | 1.5rem   | Page titles          |
| `text-4xl`     | 2.25rem  | Hero title (mobile)  |
| `text-6xl`     | 3.75rem  | Hero title (desktop) |

### Border Radius

| Token         | Value | Usage                       |
| ------------- | ----- | --------------------------- |
| `rounded-md`  | 6px   | Badges, checkboxes          |
| `rounded-lg`  | 8px   | Inputs, buttons             |
| `rounded-xl`  | 12px  | Cards, panels               |
| `rounded-2xl` | 16px  | Large panels, hero sections |

### Shadows & Glow

#### Dark Mode

| Token                | Value                                                                                     | Usage            |
| -------------------- | ----------------------------------------------------------------------------------------- | ---------------- |
| `shadow-card`        | `0 0 0 1px rgba(6,214,160,0.1), 0 4px 24px rgba(0,0,0,0.4)`                               | Card default     |
| `shadow-card-hover`  | `0 0 0 1px rgba(6,214,160,0.4), 0 0 20px rgba(6,214,160,0.1), 0 8px 32px rgba(0,0,0,0.5)` | Card hover       |
| `shadow-glow`        | `0 0 15px rgba(6,214,160,0.3)`                                                            | Button focus     |
| `shadow-input-focus` | `0 0 0 2px rgba(6,214,160,0.5)`                                                           | Input focus ring |

#### Light Mode

| Token               | Value                                                       | Usage        |
| ------------------- | ----------------------------------------------------------- | ------------ |
| `shadow-card`       | `0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)`    | Card default |
| `shadow-card-hover` | `0 4px 16px rgba(0,0,0,0.1), 0 0 0 1px rgba(6,214,160,0.3)` | Card hover   |

## Technical Architecture

### Dependency Changes

**Remove:**

- `bootstrap` — CSS framework
- `bootstrap-icons` — icon library
- `sass` — SCSS preprocessor (no longer needed)

**Add:**

- `tailwindcss@4` — CSS framework
- `@tailwindcss/postcss` — PostCSS integration
- `@headlessui/react` — Unstyled UI primitives (dropdown, tabs, disclosure)
- `lucide-react` — Icon library

### Bootstrap JS Component Replacements

| Bootstrap Component | Usage Location                  | Replacement                         |
| ------------------- | ------------------------------- | ----------------------------------- |
| Dropdown            | Header tools menu               | `@headlessui/react` Menu            |
| Tabs                | Hashing, ASCII, HTML Code pages | `@headlessui/react` Tab             |
| Collapse            | Password FAQ, Cipher page       | `@headlessui/react` Disclosure      |
| Toast               | Global notifications            | Custom React component with context |
| Navbar              | Header                          | Custom Tailwind implementation      |

### File Structure After Migration

```
styles/
  globals.css          ← Tailwind directives + custom utilities
  fonts.css            ← Google Fonts imports

components/
  ui/
    button.tsx         ← Shared button variants
    card.tsx           ← Tool card with neon border
    input.tsx          ← Styled input/textarea
    tabs.tsx           ← Tab wrapper using Headless UI
    toast.tsx          ← Toast notification system
    dropdown.tsx       ← Dropdown menu using Headless UI
    accordion.tsx      ← Disclosure/accordion using Headless UI
    badge.tsx          ← Status badges
    copy-btn.tsx       ← Copy to clipboard button
  layout.tsx           ← Main layout wrapper
  header.tsx           ← Navigation header
  footer.tsx           ← Footer
  code.tsx             ← Syntax highlighted code display

pages/
  (all existing pages, converted to Tailwind classes)
```

### Tailwind Configuration

Custom theme extends in `tailwind.config.ts`:

```typescript
{
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-input': 'var(--bg-input)',
        'fg-primary': 'var(--fg-primary)',
        'fg-secondary': 'var(--fg-secondary)',
        'fg-muted': 'var(--fg-muted)',
        'accent-cyan': '#06D6A0',
        'accent-purple': '#8B5CF6',
        'accent-cyan-dim': 'rgba(6,214,160,0.15)',
        'accent-purple-dim': 'rgba(139,92,246,0.15)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(6,214,160,0.1), 0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 0 0 1px rgba(6,214,160,0.4), 0 0 20px rgba(6,214,160,0.1), 0 8px 32px rgba(0,0,0,0.5)',
        'glow': '0 0 15px rgba(6,214,160,0.3)',
        'input-focus': '0 0 0 2px rgba(6,214,160,0.5)',
      },
    },
  },
}
```

CSS variables for theme switching in `globals.css`:

```css
@layer base {
  :root {
    /* light mode defaults */
    --bg-base: #f8fafc;
    --bg-surface: #ffffff;
    --bg-elevated: #ffffff;
    --bg-input: #f1f5f9;
    --fg-primary: #0f172a;
    --fg-secondary: #475569;
    --fg-muted: #94a3b8;
  }

  .dark {
    --bg-base: #0b0f1a;
    --bg-surface: #111827;
    --bg-elevated: #1e293b;
    --bg-input: #0d1117;
    --fg-primary: #f1f5f9;
    --fg-secondary: #94a3b8;
    --fg-muted: #64748b;
  }
}
```

## Component Designs

### Header

- Background: `bg-surface/80` + `backdrop-blur-md` (frosted glass)
- Bottom border: 1px with subtle gradient from cyan to purple (very faint)
- Brand: JetBrains Mono, bold, with subtle text shadow
- Tool title (when on tool page): `accent-cyan` color
- Tools dropdown: Headless UI Menu, `bg-elevated` surface, items highlight with `accent-cyan-dim`
- Theme toggle button: outline style, icon changes sun/moon
- Language switcher: same style as theme toggle

### Footer

- Background: `bg-surface`
- Top border: 1px `border-default`
- Links: `fg-muted` → `accent-cyan` on hover
- Copyright: `fg-muted`, `text-sm`

### Tool Cards (Home Page)

- Background: `bg-surface`
- Border: 1px `border-default` → `border-glow` on hover
- Shadow: `shadow-card` → `shadow-card-hover` on hover
- Transform: `translateY(-2px)` on hover
- Transition: `all 200ms ease`
- Icon area: Each tool gets a unique icon from Lucide
- Title: `font-semibold`, `fg-primary`
- Description: `text-sm`, `fg-secondary`
- CTA button: `border-accent-cyan text-accent-cyan` → hover fills `bg-accent-cyan text-bg-base`
- Disabled state: `fg-muted`, border muted, no hover effect

### Hero Section (Home Page)

- Background: gradient from `#0B0F1A` to `#1a1040`
- Subtle grid pattern overlay (CSS `background-image` with linear gradients)
- Title: `text-6xl` (desktop), `text-4xl` (mobile), JetBrains Mono, `accent-cyan`
- Subtitle: `text-xl`, `fg-secondary`
- Text shadow on title: `0 0 30px rgba(6,214,160,0.3)`
- CTA button: large, `border-accent-cyan` → fills on hover

### Form Elements

**Input / Textarea:**

- Background: `bg-input`
- Border: 1px `border-default`
- Focus: border transitions to `accent-cyan` + `shadow-input-focus`
- Placeholder: `fg-muted`
- Rounded: `rounded-lg`

**Primary Button:**

- Background: `accent-cyan`
- Text: `bg-base` (dark)
- Hover: lighter cyan + `shadow-glow`
- Active: `scale-95`
- Rounded: `rounded-lg`

**Secondary Button:**

- Border: `accent-purple`
- Text: `accent-purple`
- Hover: `bg-accent-purple-dim`

**Danger Button:**

- Text: `danger`
- Hover: `bg-red-500/10`

**Checkbox:**

- Accent color: `accent-cyan` when checked
- Label: `fg-secondary`

**Select:**

- Same style as input
- Dropdown: `bg-elevated`

### Tabs

- Headless UI Tab component
- Tab list: no background, bottom border `border-default`
- Active tab: bottom border `accent-cyan`, text `accent-cyan`, `font-semibold`
- Inactive tab: text `fg-muted` → `fg-secondary` on hover
- Tab panels: `bg-surface`, `rounded-xl`, `p-4`

### Tables

- Background: `bg-surface`
- Header row: `bg-elevated`, `text-sm`, `fg-secondary`, `uppercase`, `tracking-wider`
- Body rows: `border-b border-default`
- Striped rows: alternating `bg-elevated/50`
- Match/highlight rows: `bg-accent-cyan-dim` + `text-accent-cyan`
- Hash/code values: `font-mono`, `text-sm`
- Copy button per row

### Accordion / Disclosure

- Headless UI Disclosure
- Trigger: `bg-surface`, `border-b border-default`, `fg-primary`, `font-semibold`
- Chevron icon rotates on open
- Content: `py-3`, `fg-secondary`, `text-sm`
- Open state: subtle left border `accent-cyan`

### Code Display

- Background: `bg-input`
- Rounded: `rounded-lg`
- Padding: `p-4`
- Syntax colors:
  - Comment: `#467790` (teal)
  - Keyword: `#06D6A0` (cyan — matches accent)
  - Operator: `#8B5CF6` (purple — matches accent)
  - String: `#10B981` (green)
  - Punctuation: `#8B5CF6` (purple)
  - Function: `#A78BFA` (lighter purple)

### Toast Notifications

- Position: fixed top-right
- Background: `bg-elevated`
- Left border: 3px (cyan for success, red for error)
- Text: `fg-primary`
- Close button: `fg-muted` → `fg-primary` on hover
- Auto-dismiss after configurable timeout
- Enter animation: slide in from right + fade in

### Back to Top Button

- Position: fixed bottom-right
- Background: `bg-surface`
- Border: 1px `border-default`
- Icon: Lucide `ArrowUp`
- Hover: `border-glow` + `shadow-glow`
- Show/hide based on scroll position (threshold: 400px)
- Transition: opacity + transform

## Theme Strategy

- **Dark mode is the default and primary experience.**
- Theme state managed via existing `libs/theme.tsx` (React Context + localStorage).
- Theme switching toggles `dark` class on `<html>` element (replacing `data-bs-theme`).
- CSS variables change values based on `.dark` class.
- System preference detection via `prefers-color-scheme`.
- Light mode is fully supported but considered secondary.

## Animation Rules

### Allowed

| Effect                | Implementation                 | Duration |
| --------------------- | ------------------------------ | -------- |
| Hover transitions     | `transition-all duration-200`  | 200ms    |
| Focus glow            | Border + box-shadow transition | 200ms    |
| Card hover lift       | `hover:-translate-y-0.5`       | 200ms    |
| Page element fade-in  | `opacity 0→1`                  | 300ms    |
| Button click feedback | `active:scale-95`              | Instant  |
| Dropdown/tab open     | Scale-y + opacity              | 150ms    |
| Toast slide-in        | Transform + opacity            | 200ms    |

### Forbidden

- Continuous background animations
- Particle effects
- Marquee/running light borders
- Blinking/pulsing elements
- Typewriter effects
- Parallax scrolling

## Migration Plan (High-Level)

### Phase 1: Infrastructure

- Install Tailwind CSS 4 + configure design tokens
- Install `@headlessui/react` + `lucide-react`
- Set up `globals.css` with Tailwind directives and CSS variables
- Add Google Fonts (JetBrains Mono + Inter)
- Remove Bootstrap SCSS import, keep temporarily for reference

### Phase 2: Core Components

- Layout wrapper (responsive grid)
- Header (navigation + tool menu dropdown)
- Footer
- Toast notification system (custom)
- CopyButton
- Shared UI atoms (Button, Card, Input)

### Phase 3: Page Conversion (page by page)

- Home (Hero + tool cards)
- Hashing
- Base64
- Cipher
- Password
- Checksum
- ASCII
- HTML Code
- Storage Unit
- TnC pages (terms + privacy)

### Phase 4: Cleanup

- Delete all `.module.css` files
- Delete `styles/globals.scss`
- Remove Bootstrap, Bootstrap Icons, and Sass from `package.json`
- Update `next.config.js` (remove sassOptions)
- Full functional verification on all pages

## Files Changed

### Delete

- `styles/globals.scss`
- `styles/*.module.css` (all 7 page module CSS files)
- `components/*.module.css` (all 3 component module CSS files)

### Create

- `styles/globals.css` — Tailwind directives + CSS variables
- `styles/fonts.css` — Google Fonts imports
- `components/ui/button.tsx` — Button component with variants
- `components/ui/card.tsx` — Neon card component
- `components/ui/input.tsx` — Styled form inputs
- `components/ui/tabs.tsx` — Tab component (Headless UI)
- `components/ui/toast.tsx` — Toast notification system
- `components/ui/dropdown.tsx` — Dropdown menu (Headless UI)
- `components/ui/accordion.tsx` — Accordion/disclosure (Headless UI)
- `components/ui/badge.tsx` — Status badges
- `tailwind.config.ts` — Tailwind configuration with design tokens

### Modify

- `package.json` — Add/remove dependencies
- `next.config.js` — Remove sassOptions, add Tailwind config
- `pages/_app.tsx` — Update imports, add fonts
- `pages/_document.tsx` — Update theme initialization
- `libs/theme.tsx` — Switch from `data-bs-theme` to `dark` class
- `components/layout.tsx` — Full Tailwind rewrite
- `components/header.tsx` — Full Tailwind rewrite with Headless UI
- `components/footer.tsx` — Full Tailwind rewrite
- `components/code.tsx` — Full Tailwind rewrite
- `components/copybtn.tsx` — Full Tailwind rewrite
- `components/toast.tsx` — Full Tailwind rewrite
- `components/spinner.tsx` — Full Tailwind rewrite
- `components/nodata.tsx` — Full Tailwind rewrite
- `components/error.tsx` — Full Tailwind rewrite
- `components/language_switcher.tsx` — Full Tailwind rewrite
- All 11 page files — Replace Bootstrap classes with Tailwind classes

## Verification Criteria

- [ ] All pages render correctly in dark mode
- [ ] All pages render correctly in light mode
- [ ] Theme toggle works and persists across page navigation
- [ ] Language switching works (en/zh-CN/zh-TW)
- [ ] All tool functionality preserved (hashing, base64, cipher, etc.)
- [ ] Copy buttons work on all pages
- [ ] Toast notifications display correctly
- [ ] Responsive layout works on mobile (375px), tablet (768px), desktop (1280px)
- [ ] No Bootstrap CSS/JS loaded (verify in network tab)
- [ ] No console errors
- [ ] `npm run build` succeeds
