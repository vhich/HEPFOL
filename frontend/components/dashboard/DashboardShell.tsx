import { parentModeWrapper } from "@/utils/general_styles";
import { cn } from "cn";
import { ReactNode } from "react";

const DashboardShell = ({ children }: { children: ReactNode }) => {
  return (
    <section
      className={cn(
        "min-h-screen dark:bg-background bg-secondary py-20",
        parentModeWrapper,
      )}
    >
      <div className="mx-auto max-w-300 px-6">{children}</div>
    </section>
  );
};

export default DashboardShell;
