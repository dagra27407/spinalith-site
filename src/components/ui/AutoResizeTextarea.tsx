// AutoResizeTextarea.tsx
import { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

interface AutoResizeTextareaProps {
  value: string;
  className?: string;
  readOnly?: boolean;
}

export function AutoResizeTextarea({ value, className = "", readOnly = false }: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto"; // reset first
    el.style.height = `${el.scrollHeight}px`; // fit to content
  }, [value]);

  return (
    <Textarea
      ref={ref}
      value={value}
      readOnly={readOnly}
      className={`resize-none overflow-hidden ${className}`}
    />
  );
}
