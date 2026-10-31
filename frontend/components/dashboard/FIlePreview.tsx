import { MediaFile } from "@/lib/dashboard_types";
import { useDBcontext } from "@/providers/dashboardProvider";
import { headingSix } from "@/utils/general_styles";
import { FileHeadphone, FileImage, LucideIcon, X } from "lucide-react";
import Image from "next/image";
import { IconType } from "react-icons";
import { AiOutlineFilePdf } from "react-icons/ai";

export function FilePreview({
  item,
  onRemove,
}: {
  item: MediaFile;
  onRemove: () => void;
}) {
  const file = item.file;
  const isAudio = file.type.startsWith("audio/");
  const isVideo = file.type.startsWith("video/");
  const isPdf = file.type.startsWith("application/");
  const isImage = file.type.startsWith("image/");
  let Icon: LucideIcon | IconType = FileImage;

  const { files, uploadError, inputType } = useDBcontext();
  const invalidUpload = uploadError?.valid === false;

  if (isAudio) {
    Icon = FileHeadphone;
  } else if (isPdf) Icon = AiOutlineFilePdf;
  return (
    <div
      className={`group relative items-center gap-3 overflow-hidden p-2.5 ${invalidUpload && "bg-destructive/35 rounded-2xl sm:px-10 px-4 border border-destructive sm:h-20 h-fit block sm:flex"} flex`}
    >
      {invalidUpload ? null : (
        <>
          {item.preview && (
            <div
              className={`${files.length > 1 ? "h-20 w-20" : "h-30 sm:w-auto w-20"} rounded-lg overflow-hidden flex shrink-0 items-center justify-center relative`}
            >
              {isImage ? (
                <>
                  <Image
                    width={100}
                    height={100}
                    src={item.preview}
                    alt={file.name}
                    className={`w-full h-full object-cover`}
                  />
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove();
                    }}
                    className={`absolute top-1.5 right-1.5 z-10 rounded-full bg-muted-foreground text-white p-1`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <>
                  {!isVideo && (
                    <Icon className="sm:h-30 sm:w-30 h-20 w-20 max-w-20 min-w-20 text-ring/50" />
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      <div
        className={`${invalidUpload ? "sm:w-0 w-full sm:flex-1" : " w-0 flex-1"}`}
      >
        {invalidUpload ? (
          <>
            {/* <h6
              className={`truncate text-destructive font-semibold tracking-wider ${headingSix}`}
            >
              MAXIMUM SIZE/DURATION EXCEEDED
            </h6> */}
            <p className="text-destructive sm:truncate sm:text-xl text-md">
              {uploadError.error}
            </p>
          </>
        ) : (
          <>
            {inputType !== "images" && (
              <>
                {" "}
                <h6 className={`truncate ${headingSix}`}>{file.name}</h6>
                <p className="mt-1 text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            )}
          </>
        )}
      </div>
      {inputType !== "images" && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition  ${invalidUpload ? "hover:bg-red-400 sm:static absolute top-1.5 right-1.5" : "hover:bg-ring"}  hover:font-bold`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
