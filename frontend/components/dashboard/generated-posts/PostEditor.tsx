"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { GeneratedChannelPost } from "@/lib/generated_post_types";
import { PlatformMediaRule } from "@/lib/platform-media-rules";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { FileUploadLabel } from "../FileUploadLabel";
import type { MediaFile } from "./GeneratedContent";

type Props = {
  post: GeneratedChannelPost;
  value: string;
  onChange: (value: string) => void;
  media: MediaFile[];
  onMediaChange: (files: MediaFile[]) => void;
  platformRules?: PlatformMediaRule;
  firstComment?: string;
  onFirstCommentChange?: (value: string) => void;
  shareToFeed?: boolean;
  onShareToFeedChange?: (value: boolean) => void;
  showFirstComment?: boolean;
  showShareToFeed?: boolean;
};

export function PostEditor({
  post,
  value,
  onChange,
  media,
  onMediaChange,
  platformRules,
  firstComment = "",
  onFirstCommentChange,
  shareToFeed = true,
  onShareToFeedChange,
  showFirstComment = false,
  showShareToFeed = false,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const characterCount = value.length;
  const isOverLimit = characterCount > post.maxCharacters;
  const remaining = post.maxCharacters - characterCount;

  // Live validation of the CURRENT platform against the shared media
  const ruleViolations = useMemo(() => {
    if (!platformRules) return [];

    const violations: string[] = [];
    const images = media.filter((m) => m.type === "image");
    const videos = media.filter((m) => m.type === "video");

    if (images.length > platformRules.maxImages) {
      violations.push(
        `This platform allows max ${platformRules.maxImages} images (you have ${images.length})`,
      );
    }
    if (videos.length > platformRules.maxVideos) {
      violations.push(
        `This platform allows max ${platformRules.maxVideos} videos (you have ${videos.length})`,
      );
    }
    if (media.length > platformRules.maxTotalMedia) {
      violations.push(
        `This platform allows max ${platformRules.maxTotalMedia} media items`,
      );
    }

    media.forEach((m) => {
      const sizeMB = m.file.size / (1024 * 1024);
      if (m.type === "image" && sizeMB > platformRules.maxImageSizeMB) {
        violations.push(
          `${m.file.name} exceeds ${platformRules.maxImageSizeMB} MB image limit`,
        );
      }
      if (m.type === "video" && sizeMB > platformRules.maxVideoSizeMB) {
        violations.push(
          `${m.file.name} exceeds ${platformRules.maxVideoSizeMB} MB video limit`,
        );
      }
      if (
        m.type === "image" &&
        !platformRules.allowedImageTypes.includes(m.file.type)
      ) {
        violations.push(
          `${m.file.name}: image type not supported on this platform`,
        );
      }
      if (
        m.type === "video" &&
        !platformRules.allowedVideoTypes.includes(m.file.type)
      ) {
        violations.push(
          `${m.file.name}: video type not supported on this platform`,
        );
      }
    });

    return violations;
  }, [media, platformRules]);

  const validateAndAddFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const newFiles: MediaFile[] = [];
      const errors: string[] = [];

      Array.from(fileList).forEach((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
          errors.push(`${file.name}: unsupported file type`);
          return;
        }

        newFiles.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          type: isImage ? "image" : "video",
        });
      });

      if (errors.length) {
        setUploadError(errors.join(" • "));
        setTimeout(() => setUploadError(null), 5000);
      }

      if (newFiles.length) {
        onMediaChange([...media, ...newFiles]);
      }
    },
    [media, onMediaChange],
  );

  const removeMedia = (id: string) => {
    const target = media.find((m) => m.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onMediaChange(media.filter((m) => m.id !== id));
  };

  return (
    <section className="flex h-full flex-col">
      {/* <div className="flex items-center justify-between">
        <p className={"font-medium text-muted-foreground"}>Edit {post.label}</p>
        <span
          className={cn(
            "text-xs font-medium tabular-nums",
            isOverLimit ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {characterCount.toLocaleString()} /{" "}
          {post.maxCharacters.toLocaleString()}
        </span>
      </div> */}

      {/* <Separator className={"my-2"} /> */}

      <div className="flex-1 space-y-5 overflow-y-auto pr-1 bg-input/50 flex flex-col justify-between">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="resize-none border-0 bg-transparent text-[15px] leading-7 shadow-none focus-visible:ring-0 p-6"
          placeholder="Write your post..."
          cols={200}
        />
        <div className="space-y-10 p-6">
          {/* Drag & Drop */}
          <FileUploadLabel
            role="Upload media file to post along with your generated content"
            setIsDragging={setIsDragging}
            isDragging={isDragging}
            validateAndAddFiles={validateAndAddFiles}
            labelFor={"upload-post-media"}
            className={cn("w-30 h-30")}
          />
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            hidden
            id="upload-post-media"
            name="upload-post-media"
            onChange={(e) => validateAndAddFiles(e.target.files)}
          />

          {/* Thumbnails */}
          {media.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {media.map((m) => (
                <div
                  key={m.id}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
                >
                  {m.type === "image" ? (
                    <Image
                      width={100}
                      height={100}
                      src={m.previewUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={m.previewUrl}
                      className="h-full w-full object-cover"
                      muted
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(m.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Live platform rule violations */}
          {ruleViolations.length > 0 && (
            <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-4" />
                Issues for {post.label}
              </div>
              <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                {ruleViolations.map((v, i) => (
                  <li key={i}>• {v}</li>
                ))}
              </ul>
            </div>
          )}

          {uploadError && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* First Comment */}
          {showFirstComment && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">First Comment</Label>
              <Textarea
                value={firstComment}
                onChange={(e) => onFirstCommentChange?.(e.target.value)}
                placeholder="Add a first comment (optional)..."
                className="min-h-[80px] resize-none text-sm"
              />
            </div>
          )}

          {/* Share to Feed */}
          {showShareToFeed && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Share to Feed</Label>
                <p className="text-xs text-muted-foreground">
                  Also post this Reel to your main feed
                </p>
              </div>
              <Switch
                checked={shareToFeed}
                onCheckedChange={(checked) => onShareToFeedChange?.(checked)}
              />
            </div>
          )}

          {isOverLimit && (
            <p className="mt-3 text-xs text-destructive">
              {Math.abs(remaining)} characters over the limit for this platform.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
