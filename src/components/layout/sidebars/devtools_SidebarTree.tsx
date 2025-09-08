// src/components/layout/sidebars/devtools_SidebarTree.tsx

import { useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useLocation, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
import clsx from "clsx";

export default function DevtoolsSidebarTree() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      label: "Narrative DNA",
      path: "/devtools/narrative-dna", // placeholder if you want static section later
      static: true
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
      ],
    },
  ];

  return (
    <div
      className={clsx(
        "transition-all duration-300 border-r bg-gray-100 overflow-y-auto",
        collapsed ? "w-16" : "w-64",
        "p-4"
      )}
    >
      {/* Collapse Toggle Button */}
      <div className="flex justify-end mb-4">
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Optional App Title */}
      {!collapsed && (
        <div className="text-xl font-bold text-gray-800 mb-4">Spinalith</div>
      )}

      {/* Accordion Navigation */}
      <Accordion type="multiple" className="w-full space-y-2">
        {navItems.map((section, index) =>
          section.static ? (
            !collapsed && (
              <div
                key={index}
                className="text-sm font-semibold text-gray-800 mb-2"
              >
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
                      {section.items.map((item) => (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            className={clsx(
                              "block px-2 py-1 rounded hover:bg-gray-200 transition",
                              location.pathname === item.path
                                ? "bg-gray-200 font-medium"
                                : "text-gray-700"
                            )}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </>
              ) : (
                // Minimal collapsed representation (optional icons)
                <div className="flex items-center justify-center py-2">
                  {/* <Circle size={16} className="text-gray-400" /> */}
                </div>
              )}
            </AccordionItem>
          )
        )}
      </Accordion>
    </div>
  );

}


