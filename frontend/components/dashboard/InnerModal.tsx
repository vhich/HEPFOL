import { useDBcontext } from "@/providers/dashboardProvider";
import { childModeWrapper, headingFour } from "@/utils/general_styles";
import { cn } from "cn";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "../ui/button";

interface InnerModalTypes {
  isHidden: boolean;
  roleDescription: string;
  title: string;
  className?: string;
  children: ReactNode;
}

const InnerModal = ({
  isHidden,
  roleDescription,
  title,
  className,
  children,
}: InnerModalTypes) => {
  const { setOpenModal, setWorkFlow, removeFileandUrl } = useDBcontext();
  return (
    <div
      aria-hidden={isHidden}
      aria-roledescription={roleDescription}
      className={cn(
        "mx-auto h-full pb-3 modal-entry overflow-auto",
        childModeWrapper,
        className,
      )}
    >
      <div className="w-full my-3 px-2">
        <Button
          type="button"
          role="close modal button"
          aria-roledescription="close connect channel modal"
          onClick={() => {
            {
              setWorkFlow("");
              setOpenModal(false);
              removeFileandUrl();
            }
          }}
          className={cn(
            "ml-auto bg-transparent text-foreground border border-border block",
          )}
        >
          <X />{" "}
        </Button>
      </div>
      <h4 className={cn("text-center mb-4", headingFour)}>{title}</h4>
      {children}
    </div>
  );
};

export default InnerModal;
