import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner'
import { supabase } from "@/lib/supabaseClient";


/**
 * TestEdgeFunctionView – A developer tool for manually testing Edge Functions.
 * Allows manual entry of EF name and JSON payload, and tracks recent EF calls using localStorage.
 */
export default function TestEdgeFunctionView() {
  const [duplicateTable, setDuplicateTable] = useState("");
  const [duplicateId, setDuplicateId] = useState("");
  const [uniqueColumnToStrip, setUniqueColumnToStrip] = useState(""); // NEW



const handleDuplicateRecord = async () => {
  if (!duplicateTable || !duplicateId) {
    toast.error("⚠️ Missing Required Info", {
      description: "Table name and Record ID are required.",
    });
    return;
  }

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

  // Remove standard ID
  delete data.id;

  // Remove user-specified unique column if provided
  if (uniqueColumnToStrip && uniqueColumnToStrip in data) {
    delete data[uniqueColumnToStrip];
  }

   // Remove created_at if it is in the record, this allows the duplicate to get the default now() value
  if ("created_at" in data) {
    delete data["created_at"];
  }

  const { data: inserted, error: insertError } = await supabase
    .from(duplicateTable)
    .insert([data])
    .select();

  if (insertError) {
    toast.error("⚠️ Duplication Failed", {
      description: insertError.message,
    });
  } else if (inserted && inserted.length > 0) {
    toast.success("✅ Record Duplicated", {
      description: `New ID: ${inserted[0].id}`,
    });
  } else {
    toast.success("✅ Record Duplicated", {
      description: "New record was created, but no ID was returned.",
    });
  }
};






  return (
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold">🔁 Duplicate Record Tool</h2>

        <div className="space-y-2">
          <Label>Table Name</Label>
          <Input
            placeholder="wf_assistant_automation_control"
            value={duplicateTable}
            onChange={(e) => setDuplicateTable(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Unique Column to Exclude</Label>
          <Input
            placeholder="e.g. request_id"
            value={uniqueColumnToStrip}
            onChange={(e) => setUniqueColumnToStrip(e.target.value)}
          />
        </div>


        <div className="space-y-2">
          <Label>Record ID</Label>
          <Input
            placeholder="e.g. 49d7ebc9-1234-xyz"
            value={duplicateId}
            onChange={(e) => setDuplicateId(e.target.value)}
          />
        </div>

        <Button onClick={handleDuplicateRecord}>
          Duplicate Record
        </Button>
      </div>
  );
}
