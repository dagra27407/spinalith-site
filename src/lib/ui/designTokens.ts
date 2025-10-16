/**
 * designTokens.ts
 *
 * Plain-English: This file is our single source of truth for spacing, sizes, radii,
 * typography scale, icon sizing, and theme palettes. Import these instead of
 * sprinkling magic numbers. At 2am, you can tweak app-wide look & feel here.
 *
 * How to use (quick):
 *  - Spacing: style={{ padding: `${SPACE.pageY} ${SPACE.pageX}` }} or gap-[SPACE.grid]
 *  - Radii: className="rounded-[var(--radius-card)]" (we set CSS vars below)
 *  - Icons: <Icon as={Trash2} size={ICON.size} strokeWidth={ICON.stroke} />
 *  - Themes: call applyTheme("indigo") once on app load (e.g., in App.tsx useEffect)
 *  - Persist user choice: setTheme("indigo") which also updates localStorage
 */

// --------------------
// Core scales (JS constants)
// --------------------
export const RADIUS = {
  card: "16px",
  panel: "16px",
  button: "12px",
} as const;

export const SPACE = {
  pageX: "24px",
  pageY: "24px",
  grid: "16px",
  section: "20px",
} as const;

export const ICON = {
  size: 20,
  stroke: 1.75,
} as const;

export const LAYOUT = {
  contentMaxWidth: "1100px",
} as const;

export const TYPE_SCALE = {
  page: "1.5rem",     // 24px
  section: "1.25rem", // 20px
  base: "1rem",       // 16px
  small: "0.875rem",  // 14px
} as const;

// --------------------
// Theme palettes
// --------------------
/**
 * Plain-English: We define semantic color tokens (background, foreground, primary, etc.)
 * that map to CSS variables. Each palette is a set of HSL strings that play nicely
 * with shadcn/ui (which also uses CSS vars). You can add more palettes below.
 */
export type ThemeKey = "slate" | "indigo" | "rose" | "emerald";

// HSL values (no need to wrap in hsl() here; we'll add that when setting CSS vars)
const THEMES: Record<ThemeKey, Record<string, string>> = {
  slate: {
    background: "0 0% 100%",
    foreground: "222 84% 4%",
    muted: "210 40% 96%",
    mutedForeground: "215 16% 47%",
    border: "214 32% 91%",
    input: "214 32% 91%",
    ring: "222 84% 4%",
    primary: "222 47% 50%",
    primaryForeground: "210 40% 98%",
    secondary: "210 40% 96%",
    secondaryForeground: "222 47% 11%",
    destructive: "0 84% 60%",
    destructiveForeground: "0 0% 98%",
    accent: "210 40% 96%",
    accentForeground: "222 47% 11%",
    popover: "0 0% 100%",
    popoverForeground: "222 84% 4%",
    card: "0 0% 100%",
    cardForeground: "222 84% 4%",
  },
  indigo: {
    background: "0 0% 100%",
    foreground: "222 84% 4%",
    muted: "226 100% 97%",
    mutedForeground: "226 35% 45%",
    border: "225 67% 92%",
    input: "225 67% 92%",
    ring: "226 100% 45%",
    primary: "226 100% 45%",
    primaryForeground: "210 40% 98%",
    secondary: "226 100% 97%",
    secondaryForeground: "226 50% 20%",
    destructive: "0 84% 60%",
    destructiveForeground: "0 0% 98%",
    accent: "226 100% 97%",
    accentForeground: "226 50% 20%",
    popover: "0 0% 100%",
    popoverForeground: "222 84% 4%",
    card: "0 0% 100%",
    cardForeground: "222 84% 4%",
  },
  rose: {
    background: "0 0% 100%",
    foreground: "230 84% 5%",
    muted: "351 100% 97%",
    mutedForeground: "351 40% 40%",
    border: "351 70% 90%",
    input: "351 70% 90%",
    ring: "351 94% 55%",
    primary: "351 94% 55%",
    primaryForeground: "0 0% 98%",
    secondary: "351 100% 97%",
    secondaryForeground: "351 50% 20%",
    destructive: "0 84% 60%",
    destructiveForeground: "0 0% 98%",
    accent: "351 100% 97%",
    accentForeground: "351 50% 20%",
    popover: "0 0% 100%",
    popoverForeground: "230 84% 5%",
    card: "0 0% 100%",
    cardForeground: "230 84% 5%",
  },
  emerald: {
    background: "0 0% 100%",
    foreground: "150 30% 6%",
    muted: "150 60% 96%",
    mutedForeground: "151 29% 35%",
    border: "151 38% 85%",
    input: "151 38% 85%",
    ring: "151 71% 40%",
    primary: "151 71% 40%",
    primaryForeground: "0 0% 98%",
    secondary: "150 60% 96%",
    secondaryForeground: "151 29% 30%",
    destructive: "0 84% 60%",
    destructiveForeground: "0 0% 98%",
    accent: "150 60% 96%",
    accentForeground: "151 29% 30%",
    popover: "0 0% 100%",
    popoverForeground: "150 30% 6%",
    card: "0 0% 100%",
    cardForeground: "150 30% 6%",
  },
};

// --------------------
// CSS Variable bridge
// --------------------
/**
 * Plain-English: We set CSS variables on <html> so Tailwind/shadcn UI can pick
 * them up. This keeps our TS and CSS worlds in sync and lets the user change
 * themes at runtime without recompiling.
 */
const VARS = {
  radiusCard: "--radius-card",
  radiusPanel: "--radius-panel",
  radiusButton: "--radius-button",
  // shadcn-compatible tokens (HSL strings – we wrap with hsl() when writing)
  background: "--background",
  foreground: "--foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  destructive: "--destructive",
  destructiveForeground: "--destructive-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
  card: "--card",
  cardForeground: "--card-foreground",
} as const;

function setCssVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

function setThemeVars(theme: Record<string, string>) {
  // Radii first (pure px)
  setCssVar(VARS.radiusCard, RADIUS.card);
  setCssVar(VARS.radiusPanel, RADIUS.panel);
  setCssVar(VARS.radiusButton, RADIUS.button);

  // Colors (wrap hsl values)
    Object.entries(theme).forEach(([key, hslTriplet]) => {
    const varName = (VARS as any)[key] as string | undefined;
    if (varName) setCssVar(varName, hslTriplet);    // ✅ just the triplet
    });

}

// --------------------
// Public API – apply/persist themes
// --------------------
const LS_KEY = "spinalith_theme";

export function applyTheme(key: ThemeKey) {
  const theme = THEMES[key];
  if (!theme) return;
  setThemeVars(theme);
  document.documentElement.setAttribute("data-theme", key);
}

export function setTheme(key: ThemeKey) {
  localStorage.setItem(LS_KEY, key);
  applyTheme(key);
}

export function initThemeFromLocalStorage(defaultKey: ThemeKey = "slate") {
  const saved = (localStorage.getItem(LS_KEY) as ThemeKey | null) ?? defaultKey;
  applyTheme(saved);
}

// --------------------
// Convenience – class helpers (optional)
// --------------------
/**
 * pageStyle: quick inline style for top-level page containers.
 */
export function pageStyle(): React.CSSProperties {
  return { padding: `${SPACE.pageY} ${SPACE.pageX}`, maxWidth: LAYOUT.contentMaxWidth };
}

/**
 * headingClass: get consistent heading classes.
 * Use: <h1 className={headingClass("page")}>Title</h1>
 */
export function headingClass(level: "page" | "section" | "sub" = "page") {
  const map = {
    page: `text-2xl font-semibold tracking-tight`,
    section: `text-xl font-semibold`,
    sub: `text-base font-medium text-muted-foreground`,
  } as const;
  return map[level];
}

// --------------------
// NOTE: Tailwind hook-up (docs for 2am-you)
// --------------------
/**
 * To make Tailwind utilities align with these tokens, set CSS variables in your
 * global stylesheet so classes like bg-background/ text-foreground work.
 *
 * Add to src/index.css (example):
 * :root {
 *   --background: hsl(0 0% 100%);
 *   --foreground: hsl(222 84% 4%);
 *   --radius-card: 16px;
 *   --radius-panel: 16px;
 *   --radius-button: 12px;
 * }
 * .bg-background { background-color: var(--background); }
 * .text-foreground { color: var(--foreground); }
 * // ...shadcn already wires most of these; we just ensure values exist.
 *
 * On app boot (e.g., App.tsx):
 *   useEffect(() => { initThemeFromLocalStorage("slate"); }, []);
 *
 * To swap palettes:
 *   setTheme("indigo"); // persists + applies immediately
 */
