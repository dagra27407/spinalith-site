/**
 * DevtoolsSidebarTree (theme-aligned)
 *
 * Plain-English (2am-you): Left sidebar navigation for the Dev Tools shell.
 * Classes-only pass to snap to our tokenized theme + utilities. No logic or
 * routing changes.
 *
 * Changes
 *  - Wrapper surface → `.app-sidebar` (muted surface, token border/colors)
 *  - Removed hard-coded grays; rely on tokens / subtle muted text
 *  - Kept collapse behavior and Accordion structure
 */

import { useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useLocation, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

export default function DevtoolsSidebarTree() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      label: "Narrative DNA",
      path: "/devtools/narrative-dna", // placeholder if you want static section later
      static: true,
    },
    {
      label: "Utils",
      items: [
        { label: "Record Duplicator", path: "/devtools/DuplicateRecordView" },
        { label: "Payload Builder", path: "/devtools/PayloadMapBuilderView" },
      ],
    },
    {
      label: "Testers",
      items: [
        { label: "Test EF", path: "/devtools/TestEdgeFunctionView" },
        { label: "Theme Tester", path: "/devtools/TestThemeView" },
        { label: "404 Test", path: "/definitely-not-a-route-404-test" },
      ],
    },
  ];

  return (
    <div
      className={clsx(
        "app-sidebar overflow-y-auto transition-all duration-300 p-3",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse Toggle Button */}
      <div className={clsx("flex mb-3", collapsed ? "justify-center" : "justify-end")}>
        <button
          className="inline-flex items-center justify-center rounded-md border border-border px-2 py-1 text-xs hover:bg-muted transition-colors"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Optional App Title */}
      {!collapsed && (
        <div className="text-sm font-semibold mb-3">Spinalith — Dev Tools</div>
      )}

      {/* Accordion Navigation */}
      <Accordion type="multiple" className="w-full space-y-2">
        {navItems.map((section, index) =>
          section.static ? (
            !collapsed && (
              <div key={index} className="text-xs font-medium text-muted-foreground mb-1">
                {section.label}
              </div>
            )
          ) : (
            <AccordionItem key={index} value={`item-${index}`}>
              {!collapsed ? (
                <>
                  <AccordionTrigger>{section.label}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="pl-2 space-y-1 text-sm">
                      {section.items.map((item) => {
                        const active = location.pathname === item.path;
                        return (
                          <li key={item.path}>
                            <Link
                              to={item.path}
                              className={clsx(
                                "block px-2 py-1 rounded transition-colors",
                                active
                                  ? "bg-muted font-medium"
                                  : "text-muted-foreground hover:bg-muted"
                              )}
                              aria-current={active ? "page" : undefined}
                            >
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </>
              ) : (
                // Minimal collapsed representation (spacer row keeps height consistent)
                <div className="py-2" />
              )}
            </AccordionItem>
          )
        )}
      </Accordion>
    </div>
  );
}
