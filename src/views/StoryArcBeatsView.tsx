import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { run_EF } from '@/lib/run_EF';
import { useParams } from "react-router-dom";

export default function StoryArcBeatsView() {
    const { projectId } = useParams();
    const [msg, setMsg] = useState('');
    const [status, setStatus] = useState('');
    const [success, setSuccess] = useState('');
    const [assistantName, setAssistantName] = useState('');
    const [record_id, setRecordId] = useState('');

    const callAssistant = async () => {
        try {
            //Define EdgeFunction name and body
            let ef_Name = "ef_init_wf_StoryArcsAssistant";
            let body_Payload = {
              narrativeProjectID: projectId as string
            };
            //Call EF
            const { data } = await run_EF(ef_Name, body_Payload);
              setMsg(data.message);
              setStatus(data.status);
              setSuccess(data.success);
              setAssistantName(data.assistantName);
              setRecordId(data.record_id);
            } catch (err) {
            console.error('Error:', err);
            setMsg('Error calling edge function.');
            }
    }
    if(status != null){    
          useEffect(() => {
            console.log(`Message:${msg}`);
            console.log(`Status:${status}`);
            console.log(`Success:${success}`);
            console.log(`Assistant Started:${assistantName}`);
            console.log(`WF_Record:${record_id}`);
          }, [msg, status, success, assistantName]);
        }
    return (
    <div className="p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Story Arc Beats</h1>
        <Button onClick={callAssistant}>Test</Button>
        <Label>Msg: {msg}</Label>
      </div>

     </div>
  );


}




