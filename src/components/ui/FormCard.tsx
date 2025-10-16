/**
 * FormCard
 * Plain-English: A consistent Card wrapper for forms with title/description
 * and an optional footer for actions (buttons).
 */
import { Card } from "@/components/ui/card";
import { PropsWithChildren, ReactNode } from "react";

interface FormCardProps {
  title: string;
  description?: string;
  headerExtra?: ReactNode;
  footer?: ReactNode; // e.g., Save/Cancel buttons
}

export function FormCard({
  title,
  description,
  headerExtra,
  footer,
  children,
}: PropsWithChildren<FormCardProps>) {
  return (
    <Card className="p-6 space-y-4 rounded-2xl shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          ) : null}
        </div>
        {headerExtra}
      </div>
      <div className="space-y-4">{children}</div>
      {footer ? <div className="pt-2">{footer}</div> : null}
    </Card>
  );
}
export default FormCard;
