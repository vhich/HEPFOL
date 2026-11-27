"use client";

import { GeneratedChannelPost } from "@/lib/generated_post_types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { FaLinkedin } from "react-icons/fa6";
import type { MediaFile } from "../GeneratedContent";

type Props = {
  post: GeneratedChannelPost;
  content: string;
  media?: MediaFile[];
  firstComment?: string;
};

export function LinkedInPost({ content, media = [], firstComment }: Props) {
  const hasMedia = media.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);

  // LinkedIn-style multi-image layouts
  const renderMedia = () => {
    if (!hasMedia) return null;

    // Single image
    if (media.length === 1) {
      const m = media[0];
      return (
        <div className="relative aspect-video w-full bg-muted">
          {m.type === "video" ? (
            <video
              src={m.previewUrl}
              className="h-full w-full object-cover"
              muted
              controls
            />
          ) : (
            <Image
              width={100}
              height={100}
              src={m.previewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>
      );
    }

    // 2 images – side by side
    if (media.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-0.5">
          {media.map((m) => (
            <div key={m.id} className="relative aspect-square bg-muted">
              {m.type === "video" ? (
                <video
                  src={m.previewUrl}
                  className="h-full w-full object-cover"
                  muted
                />
              ) : (
                <Image
                  width={100}
                  height={100}
                  src={m.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    // 3 images – large left + two stacked
    if (media.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-0.5">
          <div className="relative row-span-2 aspect-[3/4] bg-muted">
            {media[0].type === "video" ? (
              <video
                src={media[0].previewUrl}
                className="h-full w-full object-cover"
                muted
              />
            ) : (
              <Image
                width={100}
                height={100}
                src={media[0].previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {media.slice(1).map((m) => (
            <div key={m.id} className="relative aspect-square bg-muted">
              {m.type === "video" ? (
                <video
                  src={m.previewUrl}
                  className="h-full w-full object-cover"
                  muted
                />
              ) : (
                <Image
                  width={100}
                  height={100}
                  src={m.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    // 4+ images → 2×2 grid + swipe for more
    return (
      <div className="relative">
        <div
          className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
          onScroll={(e) => {
            const el = e.currentTarget;
            setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {/* First page: 2×2 grid */}
          <div className="grid w-full flex-shrink-0 snap-center grid-cols-2 gap-0.5">
            {media.slice(0, 4).map((m, i) => (
              <div
                key={m.id}
                className={cn(
                  "relative bg-muted",
                  i === 0 && media.length > 4
                    ? "aspect-square"
                    : "aspect-square",
                )}
              >
                {m.type === "video" ? (
                  <video
                    src={m.previewUrl}
                    className="h-full w-full object-cover"
                    muted
                  />
                ) : (
                  <Image
                    width={100}
                    height={100}
                    src={m.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}

                {/* “+X more” overlay on the last cell when there are extra images */}
                {i === 3 && media.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-semibold text-white">
                    +{media.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional full-width slides for remaining images */}
          {media.slice(4).map((m) => (
            <div
              key={m.id}
              className="relative aspect-video w-full flex-shrink-0 snap-center bg-muted"
            >
              {m.type === "video" ? (
                <video
                  src={m.previewUrl}
                  className="h-full w-full object-cover"
                  muted
                  controls
                />
              ) : (
                <Image
                  width={100}
                  height={100}
                  src={m.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>

        {/* Indicators (only when there are extra slides beyond the 2×2) */}
        {media.length > 4 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {Array.from({ length: Math.ceil((media.length - 4) / 1) + 1 }).map(
              (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 p-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#0A66C2]/10">
            <FaLinkedin className="size-6 text-[#0A66C2]" />
          </div>
          <div>
            <p className="text-sm font-semibold">Your Name</p>
            <p className="text-xs text-muted-foreground">Creator · 1h</p>
          </div>
        </div>

        {/* Caption */}
        <div className="whitespace-pre-wrap px-4 pb-3 text-[15px] leading-6">
          {content}
        </div>

        {/* Media */}
        {renderMedia()}

        {/* Actions */}
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          Like · Comment · Repost · Send
        </div>

        {/* First Comment */}
        {firstComment && (
          <div className="border-t px-4 py-3 text-sm">
            <span className="font-semibold">Your Name</span> {firstComment}
          </div>
        )}
      </div>
    </div>
  );
}
