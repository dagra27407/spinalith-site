// src/components/layout/SidebarTree.tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

export default function SidebarTree() {
  return (
  <div className="w-64 border-r bg-gray-50 p-2 overflow-y-auto">
    <Accordion type="multiple" className="w-full">
      {/* Static menu item (not Accordion) */}
      <div className="flex items-center justify-between px-0 py-2 font-medium text-sm text-gray-900 rounded hover:underline">
  Narrative DNA
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
  </div>
)

}

