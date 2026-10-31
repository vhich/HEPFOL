import { useDBcontext } from "@/providers/dashboardProvider";
import { cn } from "cn";
import { ReactNode } from "react";

const Modal = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { openModal, workFlow } = useDBcontext();
  return (
    <div
      aria-hidden={!openModal || !workFlow}
      className={cn(
        "fixed top-0 left-0 h-full w-full z-200 backdrop-blur-sm bg-background/50 sm:grid sm:place-items-center block",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Modal;
