import { MediaFile } from "@/lib/dashboard_types";
import { useDBcontext } from "@/providers/dashboardProvider";
import { headingSix } from "@/utils/general_styles";
import {
  FileHeadphone,
  FileImage,
  FileVideoCamera,
  LucideIcon,
  X,
} from "lucide-react";
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
  const invalidUpload = !uploadError?.valid;

  if (isAudio) {
    Icon = FileHeadphone;
  } else if (isPdf) {
    Icon = AiOutlineFilePdf;
  } else if (isVideo) Icon = FileVideoCamera;

  return (
    <div
      className={`group relative items-center gap-3 overflow-hidden p-2.5 ${invalidUpload && "bg-destructive/10 rounded-2xl sm:px-10 px-4 border border-destructive sm:h-20 h-fit block sm:flex"} flex`}
    >
      <div
        className={`${files.length > 1 && isImage ? "h-20 w-20" : "h-30 w-fit"} rounded-lg overflow-hidden flex gap-2 shrink-0 items-center justify-center relative`}
      >
        {item.preview && (
          <>
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
              <Icon className="h-15 w-15 max-w-15 text-ring/50" />
            )}
            {inputType !== "images" && (
              <>
                {" "}
                <h6 className={`truncate sm:w-45 w-40 ${headingSix}`}>
                  {file.name}
                </h6>
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
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition absolute top-1.5 right-1.5 $"hover:bg-ring"}  hover:font-bold`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

{
  /* <div
          className={`${invalidUpload ? "sm:w-0 w-full sm:flex-1" : " w-0 flex-1"}`}
        >
          <p className="text-destructive sm:truncate sm:text-xl text-md">
            {uploadError?.error}
          </p>
        </div> */
}
