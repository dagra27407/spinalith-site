/**
 * SidebarTree (theme-aligned)
 *
 * Plain-English (2am-you): Left sidebar navigation used in the default app
 * shell. This pass is classes-only so it snaps to our tokenized theme and
 * spacing model. No logic or routing changes.
 *
 * Changes
 *  - Wrapper surface → token colors: bg-card / text-card-foreground
 *  - Divider color   → border-r border-border
 *  - Removed hard-coded grays
 */

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function SidebarTree() {
  return (
    <nav
      role="complementary"
      aria-label="Primary navigation"
      className="app-sidebar w-64 p-2 overflow-y-auto"
    >
      <Accordion type="multiple" className="w-full">
        {/* Static top-level item (non-accordion) */}
        <div className="flex items-center justify-between px-0 py-2 font-medium text-sm">
          <span className="truncate">Narrative DNA</span>
        </div>

        {/* Accordion Items */}
        <AccordionItem value="item-2">
          <AccordionTrigger>Story Arcs</AccordionTrigger>
          <AccordionContent>
            <ul className="pl-4 text-sm space-y-1">
              <li>Arc 1</li>
              <li>Arc 2</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>Chapters</AccordionTrigger>
          <AccordionContent>
            <ul className="pl-4 text-sm space-y-1">
              <li>
                Chapter 1
                <ul className="pl-4">
                  <li>Scene 1</li>
                  <li>Scene 2</li>
                </ul>
              </li>
              <li>Chapter 2</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </nav>
  );
}
