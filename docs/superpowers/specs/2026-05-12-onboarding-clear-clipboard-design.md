# Onboarding: Clear Clipboard Button Guide

## Summary

After a first-time user uses any tool, show a one-time onboarding popover on the "Clear Clipboard" button (in both Header and FloatingToolbar) to teach them about this security feature.

## Trigger

The onboarding popover appears reactively when both conditions are met simultaneously:

1. **State condition**: `useRecentTools().recentTools.length > 0` — the user has used at least one tool.
2. **Flag condition**: localStorage key `okrun:onboarding:clear-clipboard` does not exist — the user has never been guided.

**How it works**: Header and FloatingToolbar subscribe to `useRecentTools` via `useSyncExternalStore`. When a tool page calls `trackUsage()`, `emitChange()` fires, triggering re-render in both components. If the flag hasn't been set, the popover appears immediately.

- **Frequency**: Exactly once per user. After dismissal, the flag is written and the guide never appears again.
- **Cross-session**: If the user has recent tools from a previous session but hasn't been onboarded, the popover appears on the next page load where the clipboard button is visible.

## Visual Effect

Two simultaneous elements:

### 1. Pulse Animation on Button

- The "Clear Clipboard" button (`ClipboardX` icon) gets a pulsing highlight ring in `var(--accent-cyan)`.
- **Implementation**: CSS `@keyframes` animation defined in `app/globals.css`, applied via a Tailwind utility class (e.g., `onboarding-pulse`). The animation is an expanding ring that fades out, repeating every ~2 seconds.
- Button background gets a subtle cyan tint (`bg-accent-cyan/10`, using Tailwind's existing `accent-cyan` CSS variable — works in both light and dark themes).
- Animation stops when the popover is dismissed (class removed).

### 2. Onboarding Popover

A popover appears below the button with:

- **Positioning**: Rendered via `createPortal` to `document.body`. Uses `position: fixed` based on `getBoundingClientRect()` of the target button. Right-aligned (button is in top-right corner). Positioned below with a small gap (~8px).
- **Z-index**: `z-[9999]` — above all other UI including modals/drawers.
- **Content**:
  - A shield/security icon (Lucide `ShieldCheck`)
  - Title text: the button's purpose (e.g., "Clear Clipboard")
  - Description text: what it does (e.g., "One-click to clear sensitive data from your browser clipboard")
  - A "Got it" confirmation button
- **Styling**: Uses theme CSS variables — `bg-bg-elevated`, `border-border-default`, shadow. Works identically in light and dark themes.
- **Arrow**: Small CSS triangle pointing up to the button, using `--accent-cyan` color.
- **Width**: Max ~280px, constrained to viewport.

## Dismissal

- **Primary path**: User clicks the "Got it" button in the popover.
- **Keyboard**: `Escape` key also dismisses the popover (standard dialog behavior).
- On dismiss: write `okrun:onboarding:clear-clipboard` = `"true"` to localStorage.
- Pulse animation and popover are removed from the DOM.
- No close-on-outside-click; the "Got it" button and Escape are the only dismissal paths.

## Accessibility

- Popover has `role="dialog"`, `aria-labelledby` (pointing to title element), `aria-describedby` (pointing to description element).
- When the popover appears, focus moves to the "Got it" button inside it.
- On dismiss (button click or Escape), focus returns to the clear clipboard button.
- `Escape` key handling via `keydown` event listener on the popover container, only when `show === true`.
- Pulse animation respects `prefers-reduced-motion`: the animation is disabled and only the background tint remains.

## Architecture

### New Files

| File                                   | Purpose                                                      |
| -------------------------------------- | ------------------------------------------------------------ |
| `hooks/use-onboarding.ts`              | Hook that checks/dismisses onboarding state via localStorage |
| `components/ui/onboarding-popover.tsx` | Reusable popover component with pulse animation              |

### Modified Files

| File                                  | Changes                                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `components/header.tsx`               | Import `useOnboarding` and `useRecentTools`, render popover on the clipboard button                             |
| `components/floating-toolbar.tsx`     | Import `useOnboarding` and `useRecentTools`, render popover on the clipboard button (fullscreen support)        |
| `libs/storage-keys.ts`                | Add `onboardingClearClipboard: "okrun:onboarding:clear-clipboard"`                                              |
| `app/globals.css`                     | Add `@keyframes onboarding-pulse` animation and `.onboarding-pulse` utility class                               |
| `public/locales/{locale}/common.json` | Add `onboarding.clearClipboardTitle`, `onboarding.clearClipboardDesc`, `onboarding.gotIt` keys (all 10 locales) |

### Hook: `use-onboarding.ts`

```ts
function useOnboarding(storageKey: string) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(storageKey) === "true";
  });

  const dismiss = () => {
    localStorage.setItem(storageKey, "true");
    setDismissed(true);
  };

  return { shouldShow: !dismissed, dismiss };
}
```

Simple `useState` is sufficient. The flag is read once on mount and written once on dismiss. There is no cross-component reactivity requirement — both Header and FloatingToolbar each have their own instance, but they share the same localStorage key, so whichever renders first after dismissal will read the flag and not show the popover.

### Popover: `onboarding-popover.tsx`

Props:

- `show: boolean` — whether to display
- `onDismiss: () => void` — callback when "Got it" is clicked or Escape is pressed
- `targetRef: RefObject<HTMLElement>` — ref to the target button for positioning
- `icon: ReactNode` — icon to show in the popover
- `title: string` — popover heading
- `description: string` — popover body text
- `buttonLabel: string` — "Got it" button text

The component:

1. Renders the popover via `createPortal` to `document.body` when `show === true`.
2. Computes position from `targetRef.current.getBoundingClientRect()` on each render (and on window `resize`).
3. Does NOT wrap the target button — the parent is responsible for applying the pulse class to the button.
4. Handles focus management (focus "Got it" on appear, restore focus on dismiss).
5. Handles Escape key dismissal.
6. Respects `prefers-reduced-motion` via `window.matchMedia`.

### Integration in Header

The existing clear clipboard button in `header.tsx` gets:

1. A `ref` attached to the button element.
2. The `onboarding-pulse` CSS class applied conditionally when `shouldShowOnboarding` is true.
3. The `OnboardingPopover` component rendered alongside (not wrapping) the button.

```tsx
const { shouldShow: notGuided, dismiss } = useOnboarding(STORAGE_KEYS.onboardingClearClipboard);
const { recentTools } = useRecentTools();
const shouldShowOnboarding = notGuided && recentTools.length > 0 && isClipboardSupported;
```

### Integration in FloatingToolbar

Same pattern as Header, applied to the FloatingToolbar's clipboard button. This ensures fullscreen users also see the onboarding. Both locations share the same localStorage flag — dismissing in either location prevents it from appearing in the other.

## i18n Keys

Added to `common.json` in all 10 locales:

| Key                              | English                                                         | Purpose              |
| -------------------------------- | --------------------------------------------------------------- | -------------------- |
| `onboarding.clearClipboardTitle` | "Clear Clipboard"                                               | Popover heading      |
| `onboarding.clearClipboardDesc`  | "One-click to clear sensitive data from your browser clipboard" | Popover description  |
| `onboarding.gotIt`               | "Got it"                                                        | Dismiss button label |

## Testing

### Unit Tests (`hooks/__tests__/use-onboarding.test.ts`)

- Returns `shouldShow: true` when localStorage flag is absent.
- Returns `shouldShow: false` when localStorage flag is `"true"`.
- `dismiss()` writes the flag and updates `shouldShow` to `false`.
- SSR guard: returns `shouldShow: false` when `window` is undefined.

### Component Tests (`components/ui/__tests__/onboarding-popover.test.tsx`)

- Renders popover in portal when `show === true`.
- Does not render when `show === false`.
- Calls `onDismiss` when "Got it" button is clicked.
- Calls `onDismiss` when Escape key is pressed.
- Has correct ARIA attributes (`role="dialog"`, `aria-labelledby`, `aria-describedby`).

## Edge Cases

- **Clipboard API not supported**: The clipboard button is already hidden via `isClipboardSupported` check. The onboarding simply won't render if the button doesn't exist. The `shouldShowOnboarding` condition explicitly includes `isClipboardSupported`.
- **Mobile**: The popover uses `position: fixed` with viewport boundary clamping. On small screens, it shifts left to avoid overflowing. Max width ~280px.
- **Multiple rapid tool uses**: The onboarding flag is checked on render. Once dismissed, it won't re-trigger in the same session even if `trackUsage` is called again.
- **Fullscreen mode**: Both Header and FloatingToolbar have the onboarding. The FloatingToolbar version handles the fullscreen case. Whichever is visible when the user first qualifies will show the popover; dismissing in one prevents the other from appearing.
- **Window resize**: Popover repositions on `resize` events while visible.
- **Reduced motion**: Pulse animation is skipped; only the background tint (`bg-accent-cyan/10`) indicates the target button. The popover still appears normally.
- **Race condition (two components mounting simultaneously)**: Both Header and FloatingToolbar could briefly compute `shouldShow: true`, but `dismiss()` writes to localStorage synchronously. The first to dismiss wins; the other won't re-render because its `useState` was already `true` — but since we check `isClipboardSupported` and the two components are mutually exclusive (Header hidden in fullscreen, FloatingToolbar hidden otherwise), they are never both mounted at the same time.
