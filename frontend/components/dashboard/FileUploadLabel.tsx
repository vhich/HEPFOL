import { ImagePlus } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export function FileUploadLabel({
  role,
  labelFor,
  className,
  setIsDragging,
  isDragging,
  validateAndAddFiles,
}: {
  role: string;
  labelFor: string;
  className?: string;
  setIsDragging: Dispatch<SetStateAction<boolean>>;
  isDragging: boolean;
  validateAndAddFiles: (e: FileList) => void;
}) {
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        validateAndAddFiles(e.dataTransfer.files);
      }}
      htmlFor={labelFor}
      role={role}
      aria-roledescription={role}
      className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed border-neutral-500 hover:border-neutral-400 hover:bg-[#323232] transition-colors cursor-pointer select-none text-center ${className} ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"}`}
    >
      <ImagePlus className="text-neutral-400 mb-3 stroke-[1.75]" />

      <span className="text-sm font-normal text-neutral-400 leading-snug">
        Drag &amp; drop or{" "}
        <span className="block text-purple-400 font-medium hover:underline">
          select a file
        </span>
      </span>
    </label>
  );
}
