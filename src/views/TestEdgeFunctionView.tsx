import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { run_EF } from "@/lib/run_EF";
import { Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import { toast } from 'sonner'
import { supabase } from "@/lib/supabaseClient";


/**
 * TestEdgeFunctionView – A developer tool for manually testing Edge Functions.
 * Allows manual entry of EF name and JSON payload, and tracks recent EF calls using localStorage.
 */
export default function TestEdgeFunctionView() {
  const [efName, setEfName] = useState("");
  const [payload, setPayload] = useState("{}");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState<{ efName: string; payload: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateTable, setDuplicateTable] = useState("");
  const [duplicateId, setDuplicateId] = useState("");
  const [uniqueColumnToStrip, setUniqueColumnToStrip] = useState(""); // NEW




  const LOCAL_STORAGE_KEY = "ef_test_history";

  /**
 * List of commonly used JSON fields for quick insertion.
 * These appear as buttons and can be added to the payload with a click.
 */
const commonFields: { key: string; value: string }[] = [
  { key: "record_id", value: "abc123" },
  { key: "user_id", value: "xyz456" },
  { key: "narrativeProjectID", value: "narr789" },
  { key: "chapter_number", value: "12" },
  { key: "assistant_name", value: "WF_Scene_ConceptCreationAssistant" },
  { key: "run_type", value: "initial" },
  { key: "request_id", value: "abc123"},
];

  /** Load previous EF calls from localStorage on mount */
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        console.warn("Failed to parse EF history from localStorage.");
      }
    }
  }, []);

  /**
   * Save a new call to localStorage history.
   * Avoids duplicates and keeps only latest 5 calls.
   */
  const saveToHistory = (entry: { efName: string; payload: string }) => {
    const updated = [
      entry,
      ...history.filter((h) => h.efName !== entry.efName || h.payload !== entry.payload),
    ].slice(0, 5);
    setHistory(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  /** Clear history in state and localStorage */
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  /** Reset the form fields: efName, payload, response */
  const clearForm = () => {
    setEfName("");
    setPayload("{}");
    setResponse("");
  };

  /** Append a key-value pair to the JSON payload string */
  const addFieldToPayload = (key: string, placeholderValue: string) => {
    try {
      const obj = JSON.parse(payload);
      obj[key] = placeholderValue;
      setPayload(JSON.stringify(obj, null, 2));
    } catch (err) {
      console.error("Invalid JSON payload:", err);
      setResponse("❌ Invalid JSON: Unable to add field.");
    }
  };

  /** Trigger the EF call using the provided EF name and payload */
  const testClick = async () => {
    try {
      setIsLoading(true);
      setResponse("⏳ Request in process...");
      const parsed = JSON.parse(payload);
      saveToHistory({ efName, payload });
      const { data } = await run_EF(efName, parsed);
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Error:", err);
      setResponse("❌ Error calling Edge Function.");
    } finally {
      setIsLoading(false);
    }
  };



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
    <Tabs defaultValue="run-ef" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="run-ef">Run EF</TabsTrigger>
        <TabsTrigger value="tools">Tools</TabsTrigger>
      </TabsList>

     <TabsContent value="run-ef">
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">🧪 Edge Function Tester</h1>

      <div className="space-y-2">
        <Label>Edge Function Name</Label>
        <Input
          placeholder="ef_router_wf_assistant_automation_control"
          value={efName}
          onChange={(e) => setEfName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Payload (JSON)</Label>
        <Textarea
          rows={10}
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          className="font-mono"
        />
        {/* Dynamic field-add buttons */}
          <div className="flex gap-2 flex-wrap mb-2">
            {commonFields.map(({ key, value }) => (
              <Button
                key={key}
                variant="outline"
                onClick={() => addFieldToPayload(key, value)}
              >
                + {key}
              </Button>
            ))}
          </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Button onClick={testClick} disabled={isLoading}>🚀 Run EF</Button>
        <Button variant="secondary" onClick={clearForm}>
          🧼 Clear Form
        </Button>
      </div>

      {response && (
        <div className="space-y-2">
          <Label>Response</Label>
          <Textarea value={response} rows={8} readOnly className="font-mono" />
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          <Label>Recent EF Calls</Label>
          <div className="space-y-2">
            {history.map((h, idx) => (
              <Button
                key={idx}
                variant="secondary"
                className="w-full justify-start text-left font-mono text-sm"
                onClick={() => {
                  setEfName(h.efName);
                  setPayload(h.payload);
                }}
              >
                🔁 {h.efName} – {h.payload.slice(0, 40)}...
              </Button>
            ))}
          </div>
          <Button variant="destructive" onClick={clearHistory}>
            🗑️ Clear History
          </Button>
        </div>
      )}
    </div>
    </TabsContent>

    <TabsContent value="tools">
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
    </TabsContent>


  </Tabs>
  );
}
