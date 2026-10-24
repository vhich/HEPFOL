import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReactNode } from "react";

export function AlertDemo({
  alertTitle,
  alertDescription,
  alertIcon,
}: {
  alertTitle: string;
  alertDescription: string;
  alertIcon: ReactNode;
}) {
  return (
    <div className="grid w-full max-w-md items-start gap-4">
      <Alert>
        {alertIcon}

        <AlertTitle>{alertTitle}</AlertTitle>
        <AlertDescription>{alertDescription}</AlertDescription>
      </Alert>
    </div>
  );
}
