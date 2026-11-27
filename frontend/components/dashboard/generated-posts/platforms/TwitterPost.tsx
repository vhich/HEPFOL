"use client";

import { GeneratedChannelPost } from "@/lib/generated_post_types";
import {
  Bookmark,
  ChartNoAxesColumn,
  Heart,
  MessageCircle,
  Repeat2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { MediaFile } from "../GeneratedContent";

type Props = {
  post: GeneratedChannelPost;
  content: string;
  media?: MediaFile[];
  firstComment?: string;
};

export function TwitterPost({ content, media = [], firstComment }: Props) {
  const hasMedia = media.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex gap-3">
          <div className="size-10 shrink-0 rounded-full bg-muted" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">Your Name</span>
              <span className="text-sm text-muted-foreground">
                @yourname · 1h
              </span>
              <X className="ml-auto size-4 text-muted-foreground" />
            </div>

            <div className="mt-2 whitespace-pre-wrap text-[15px] leading-6">
              {content}
            </div>

            {hasMedia && (
              <div className="relative mt-3">
                <div
                  className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl border scrollbar-hide"
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
                  }}
                >
                  {media.map((m) => (
                    <div
                      key={m.id}
                      className={`relative w-full flex-shrink-0 snap-center bg-muted ${
                        media.length === 1 ? "aspect-video" : "aspect-square"
                      }`}
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
                {media.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {media.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i === activeIndex
                            ? "w-4 bg-white"
                            : "w-1.5 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-between text-muted-foreground">
              <MessageCircle className="size-5" />
              <Repeat2 className="size-5" />
              <Heart className="size-5" />
              <ChartNoAxesColumn className="size-5" />
              <Bookmark className="size-5" />
              <Upload className="size-5" />
            </div>

            {firstComment && (
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Your Name</span>{" "}
                {firstComment}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
