import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { run_EF } from "@/lib/run_EF";

/**
 * TestEdgeFunctionView – Internal Developer Tool
 * ----------------------------------
 * A generic test harness component for manually invoking Supabase Edge Functions (EFs)
 * via the `run_EF` utility. Allows for direct EF endpoint and payload input.
 *
 * Features:
 * - Accepts a dynamic EF endpoint name (no `.ts` or `.js` suffix required)
 * - Accepts raw JSON payload (stringified form)
 * - Parses, validates, and sends the payload to the EF
 * - Displays success or failure output inline
 *
 * Usage:
 * - Used in development/testing environments
 * - Helps QA chain logic or isolate EF bugs
 */
export default function TestEdgeFunctionView() {
  // Track user input: EF name (endpoint), request body, and return message
  const [endpoint, setEndpoint] = useState('');
  const [payload, setPayload] = useState('{}'); // default to empty JSON
  const [msg, setMsg] = useState('');

  /**
   * testClick
   * ---------
   * Parses the payload input as JSON, sends it to the specified EF, and handles the response.
   * Handles both JSON errors and HTTP call errors with graceful messaging.
   */
  const testClick = async () => {
    try {
      // Ensure the payload is valid JSON before sending
      const parsedPayload = JSON.parse(payload);

      // Invoke the edge function via our generic runner
      const { data } = await run_EF(endpoint, parsedPayload);

      // Display the response in a pretty-printed format
      setMsg(JSON.stringify(data, null, 2));
    } catch (err: any) {
      // Show parsing or HTTP errors in the UI
      console.error('Error:', err);
      setMsg(err.message || 'Unknown error');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">🧪 TestView – Edge Function Runner</h1>

      {/* EF Endpoint input */}
      <div className="space-y-2">
        <Label htmlFor="endpoint">EF Endpoint Name</Label>
        <Input
          id="endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="e.g. ef_init_wf_StoryArcsAssistant"
        />

        {/* Raw JSON Payload input */}
        <Label htmlFor="payload">Payload (JSON format)</Label>
        <Input
          id="payload"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          placeholder='e.g. {"narrativeProjectID": "abc-123"}'
        />
      </div>

      {/* Run test button */}
      <Button onClick={testClick}>Run EF</Button>

      {/* Display result or error */}
      <div>
        <Label>Response:</Label>
        <pre className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">{msg}</pre>
      </div>
    </div>
  );
}
