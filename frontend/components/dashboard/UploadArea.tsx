import { InputType, MediaFile } from "@/lib/dashboard_types";
import { useDBcontext } from "@/providers/dashboardProvider";
import { headingFive } from "@/utils/general_styles";
import { Plus } from "lucide-react";
import { ChangeEvent, DragEvent } from "react";
import { FilePreview } from "./FIlePreview";
import CustomizeContent from "./MediaAndFileProcess";

export function UploadArea({
  type,
  files,
  isDragging,
  accept,
  fileInputRef,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onBrowse,
  onChange,
  onRemove,
}: {
  type: InputType;
  files: MediaFile[];
  isDragging: boolean;
  accept?: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onBrowse: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
}) {
  const isImages = type === "images";

  const { uploadError, inputType } = useDBcontext();

  return (
    <>
      {uploadError?.error?.toLowerCase() === "too many files" &&
        !uploadError.valid && (
          <div className="text-destructive bg-destructive/30 p-4 rounded-lg border border-destructive my-6">
            <h5 className={`${headingFive}`}>{uploadError.error}</h5>
            <p className="text-sm">Please upload maximum of 10 images.</p>
          </div>
        )}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept={accept}
          multiple={isImages}
          onChange={onChange}
        />
        {files.length > 0 ? null : (
          <div
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={onBrowse}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
              isDragging
                ? "border-primary/20 bg-primary-50"
                : "border-border hover:border-purple-300"
            }`}
          >
            <p className="text-sm mb-1 text-purple-500">
              Drag & drop your {isImages ? "images" : type} here
            </p>

            <p className="text-sm">or click to browse from your device</p>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onBrowse();
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary/50 capitalize"
            >
              <Plus className="h-4 w-4" />
              Select {type} {isImages ? "" : "File"}
            </button>
          </div>
        )}
        {files.length > 0 && (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Selected media</p>

              <span className="text-sm">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="w-full">
              <div
                className={`overflow-y-auto w-full h-fit max-h-[60dvh] ${inputType !== "images" ? "grid" : "flex flex-wrap"}`}
              >
                {files.map((item) => (
                  <FilePreview
                    key={item.id}
                    item={item}
                    onRemove={() => onRemove(item.id)}
                  />
                ))}
              </div>
              <CustomizeContent />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
