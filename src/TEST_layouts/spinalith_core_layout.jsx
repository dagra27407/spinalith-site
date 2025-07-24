import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

export default function SpinalithCoreLayout() {
  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white shadow-sm">
        <div className="text-xl font-semibold">Spinalith</div>
        <Tabs defaultValue="planning">
          <TabsList className="gap-2">
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="writing">Writing</TabsTrigger>
            <TabsTrigger value="dna">DNA</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline">Run</Button>
      </div>

      {/* Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-gray-50 p-2 overflow-y-auto">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Story Arcs</AccordionTrigger>
              <AccordionContent>
                <ul className="pl-4 text-sm space-y-1">
                  <li>Arc 1</li>
                  <li>Arc 2</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Chapters</AccordionTrigger>
              <AccordionContent>
                <ul className="pl-4 text-sm space-y-1">
                  <li>Chapter 1
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

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-gray-600">Chapter Intent</CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-gray-600">Arc References</CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-gray-600">Beat References</CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-gray-600">Character Presence</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
