import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { run_EF } from "@/lib/run_EF";


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
      
      const data = await run_EF(efName, parsed);
      const normalized = normalizeEFResponse(data);

      setResponse(JSON.stringify(normalized, null, 2));
    } catch (err) {
      console.error("ERROR FROM EF:", err);
      setResponse("❌ Error calling Edge Function.");
    } finally {
      setIsLoading(false);
    }
  };






  return (
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
  );
}


/**
 * normalizeEFResponse
 * Safely normalizes EF responses between new and legacy formats.
 *
 * @param {any} obj - The parsed JSON from the EF
 * @returns {NormalizedEFResponse}
 */
function normalizeEFResponse(obj: any): {
  success?: boolean;
  message?: string;
  data?: any;
  legacyWarning?: string;
  rawResponse?: any;
  EF_RunTime?: any;
  extraElements?: any;
} {
  const isNewFormat =
    typeof obj === "object" &&
    "success" in obj &&
    "message" in obj &&
    "data" in obj &&
    "EF_RunTime" in obj;
console.log("isNewFormat ", isNewFormat);
  if (isNewFormat) {
    const {success, message, data, EF_RunTime, ...stripped} = obj;
    return {
      success: obj.success,
      EF_RunTime: obj.EF_RunTime,
      message: obj.message,
      data: obj.data,
      extraElements: stripped,
    };
  } else {
    return {
      success: true, // Let it show up as successful for now
      legacyWarning: "This is a legacy or non-standard response format and should be updated.",
      rawResponse: obj,
    };
  }
}
