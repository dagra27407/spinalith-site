/**
 * DuplicateRecordView (snap-to-standards pass)
 *
 * Plain-English (2am-you): Dev utility to duplicate a single row from any
 * Supabase table by ID, optionally stripping a unique column before insert.
 *
 * This update ONLY changes layout/styling classes to our shared
 * utilities/tokens (no logic changes). It also adds light structure using
 * shadcn <Card> for a tidy dev tool experience.
 *
 * What changed (class-level only):
 *  - Page padding   → .app-page
 *  - Row gaps       → .app-gap
 *  - Title style    → .app-h1
 *  - Card corners   → .app-card-radius
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

export default function DuplicateRecordView() {
  const [duplicateTable, setDuplicateTable] = useState("");
  const [duplicateId, setDuplicateId] = useState("");
  const [uniqueColumnToStrip, setUniqueColumnToStrip] = useState(""); // optional

  async function handleDuplicateRecord() {
    if (!duplicateTable || !duplicateId) {
      toast.error("⚠️ Missing Required Info", {
        description: "Table name and Record ID are required.",
      });
      return;
    }

    // 1) Fetch the source row
    const { data, error } = await supabase
      .from(duplicateTable)
      .select("*")
      .eq("id", duplicateId)
      .single();

    if (error || !data) {
      toast.error("❌ Record Not Found", {
        description: error?.message ?? "No matching ID in that table.",
      });
      return;
    }

    // 2) Strip fields that must not be duplicated verbatim
    const payload: Record<string, any> = { ...data };
    delete payload.id; // always new PK

    if (uniqueColumnToStrip && uniqueColumnToStrip in payload) {
      delete payload[uniqueColumnToStrip];
    }

    if ("created_at" in payload) {
      delete payload["created_at"]; // let DB default now()
    }

    // 3) Insert the new row
    const { data: inserted, error: insertError } = await supabase
      .from(duplicateTable)
      .insert([payload])
      .select();

    if (insertError) {
      toast.error("⚠️ Duplication Failed", { description: insertError.message });
      return;
    }

    const newId = inserted?.[0]?.id;
    toast.success("✅ Record Duplicated", {
      description: newId ? `New ID: ${newId}` : "New record was created, but no ID was returned.",
    });
  }

  return (
    <div className="app-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between app-gap">
        <h1 className="app-h1">Duplicate Record (Dev Tool)</h1>
        <div className="text-sm text-muted-foreground">Supabase → Insert clone of an existing row</div>
      </div>

      <Card className="app-card-radius">
        <CardHeader>
          <CardTitle>Source & Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table">Table Name</Label>
            <Input
              id="table"
              placeholder="wf_assistant_automation_control"
              value={duplicateTable}
              onChange={(e) => setDuplicateTable(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uniqueCol">Unique Column to Exclude (optional)</Label>
            <Input
              id="uniqueCol"
              placeholder="e.g. request_id"
              value={uniqueColumnToStrip}
              onChange={(e) => setUniqueColumnToStrip(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recordId">Record ID</Label>
            <Input
              id="recordId"
              placeholder="e.g. 49d7ebc9-1234-xyz"
              value={duplicateId}
              onChange={(e) => setDuplicateId(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end app-gap">
            <Button onClick={handleDuplicateRecord}>Duplicate Record</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
