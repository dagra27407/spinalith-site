/**
 * TestThemeView
 *
 * Plain-English (2am-you): A playground page to:
 *  1) Switch between palettes defined in designTokens.ts (slate, indigo, rose, emerald).
 *  2) Persist the choice to localStorage (so a reload keeps it).
 *  3) Preview common UI pieces (buttons, inputs, badges, cards) and how tokens affect them.
 *  4) Inspect a few core CSS variable values live.
 *
 * How to hook up:
 *  - Add a dev route, e.g. /dev/test-theme -> <TestThemeView />
 *  - Make sure App.tsx initializes tokens ONCE (optional but recommended):
 *      useEffect(() => { initThemeFromLocalStorage("slate"); }, []);
 *
 * Notes:
 *  - This page uses our project "helpers" from index.css: .app-page, .app-gap, .app-card-radius, .app-h1.
 *  - The "Apply Theme" dropdown uses `setTheme()` which persists the selected theme key to localStorage.
 *  - If you tweak palette values in designTokens.ts, use the "Reapply current" button to refresh CSS vars.
 */

import { useEffect, useMemo, useState } from "react";
import { setTheme, applyTheme, type ThemeKey } from "@/lib/ui/designTokens";

// shadcn-ui primitives we actually use here
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// icons (consistent demo set)
import { Trash2, Settings, Check } from "lucide-react";

// Palette keys we support (keep in sync with designTokens.ts)
const THEME_OPTIONS: ThemeKey[] = ["slate", "indigo", "rose", "emerald"];

/** Get a human-friendly current theme string */
function getCurrentThemeKey(): ThemeKey {
  const fromAttr = (document.documentElement.getAttribute("data-theme") ?? "slate") as ThemeKey;
  const fromLS = (localStorage.getItem("spinalith_theme") as ThemeKey | null) ?? fromAttr;
  return THEME_OPTIONS.includes(fromLS) ? fromLS : "slate";
}

/** Read a few key CSS variables – handy for sanity checks */
function readCssVars() {
  const s = getComputedStyle(document.documentElement);
  const read = (name: string) => s.getPropertyValue(name).trim();
  return {
    primary: read("--primary"),
    primaryFg: read("--primary-foreground"),
    destructive: read("--destructive"),
    border: read("--border"),
    background: read("--background"),
    foreground: read("--foreground"),
  };
}

export default function TestThemeView() {
  // Selected theme (what the dropdown shows)
  const [selected, setSelected] = useState<ThemeKey>(getCurrentThemeKey());
  // Live snapshot of a few vars
  const [vars, setVars] = useState(() => readCssVars());
  // Quick toggle demos
  const [demoChecked, setDemoChecked] = useState(false);

  // Recompute vars when selection changes or when we explicitly reapply
  const refreshVars = () => setVars(readCssVars());

  useEffect(() => {
    // Sync initial state with what's actually applied
    setSelected(getCurrentThemeKey());
    refreshVars();
  }, []);

  // We compute a tiny caption so it’s easy to see what’s active
  const caption = useMemo(
    () =>
      `Active: ${document.documentElement.getAttribute("data-theme") ?? "—"} (localStorage: ${
        localStorage.getItem("spinalith_theme") ?? "—"
      })`,
    [selected, vars]
  );

  // Apply the selected theme and persist to localStorage
  const handleApply = (k: ThemeKey) => {
    setTheme(k); // persists + applies
    setSelected(k);
    refreshVars();
  };

  // Reapply the currently active theme (useful after editing designTokens.ts)
  const handleReapply = () => {
    const current = getCurrentThemeKey();
    applyTheme(current);
    refreshVars();
  };

  // Clear saved theme so App default (or index.css) shows on reload
  const handleClear = () => {
    localStorage.removeItem("spinalith_theme");
    // We keep the page as-is for now; a reload would let App default take over.
    refreshVars();
  };

  return (
    <div className="app-page space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between app-gap">
        <div>
          <h1 className="app-h1">Theme & Token Test</h1>
          <p className="text-sm text-muted-foreground">{caption}</p>
        </div>

        {/* Theme selector (dev-only control) */}
        <div className="flex items-center app-gap">
          <Select value={selected} onValueChange={(v) => handleApply(v as ThemeKey)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {THEME_OPTIONS.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleReapply}>
            Reapply current
          </Button>

          <Button variant="secondary" onClick={handleClear} title="Remove saved theme key">
            Clear saved
          </Button>
        </div>
      </div>

      {/* Token snapshot (read-only helpers) */}
      <Card className="app-card-radius">
        <CardHeader>
          <CardTitle>CSS Variables Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <TokenRow name="--primary" value={vars.primary} />
            <TokenRow name="--primary-foreground" value={vars.primaryFg} />
            <TokenRow name="--destructive" value={vars.destructive} />
            <TokenRow name="--border" value={vars.border} />
            <TokenRow name="--background" value={vars.background} />
            <TokenRow name="--foreground" value={vars.foreground} />
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: Edit palette values in <code>designTokens.ts</code>, then click <em>Reapply current</em>.
          </p>
        </CardContent>
      </Card>

      {/* Buttons preview */}
      <Card className="app-card-radius">
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center app-gap">
            <Button>
              <Check className="w-4 h-4 mr-2" />
              Primary
            </Button>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Destructive
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center app-gap">
            <Button size="sm">Primary sm</Button>
            <Button variant="destructive" size="sm">Destructive sm</Button>
            <Button variant="outline" size="sm">Outline sm</Button>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Default/Destructive read <code>--primary</code>/<code>--destructive</code>. Outline uses <code>--border</code>/<code>--background</code>.
        </CardFooter>
      </Card>

      {/* Form controls preview */}
      <Card className="app-card-radius">
        <CardHeader>
          <CardTitle>Form Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="jane@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea placeholder="Type some notes…" />
          </div>
          <div className="flex items-center app-gap">
            <div className="flex items-center app-gap">
              <Switch id="demo-switch" checked={demoChecked} onCheckedChange={setDemoChecked} />
              <label htmlFor="demo-switch" className="text-sm">
                Switch (checked: {demoChecked ? "true" : "false"})
              </label>
            </div>
            <div className="flex items-center app-gap">
              <Checkbox id="demo-check" />
              <label htmlFor="demo-check" className="text-sm">Checkbox</label>
            </div>
            <Badge>Badge</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Surface / shadow preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
        <div className="app-surface app-card-radius p-4">
          <div className="text-sm font-semibold">app-surface panel</div>
          <p className="text-sm text-muted-foreground">
            Uses <code>--card</code>/<code>--card-foreground</code> + a subtle border.
          </p>
        </div>
        <div className="app-surface app-card-radius app-shadow p-4">
          <div className="text-sm font-semibold">app-surface + app-shadow</div>
          <p className="text-sm text-muted-foreground">
            Adds a soft shadow for depth (good for hero panels).
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * TokenRow
 * Plain-English: One line of "name → value" for quick visual confirmation.
 */
function TokenRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <div className="text-xs font-mono text-muted-foreground">{name}</div>
      <div className="text-xs font-mono">{value || "—"}</div>
    </div>
  );
}
