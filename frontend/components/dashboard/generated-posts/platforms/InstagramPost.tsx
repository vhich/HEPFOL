// platforms/InstagramPost.tsx
"use client";

import { GeneratedChannelPost } from "@/lib/generated_post_types";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type MediaFile = {
  id: string;
  previewUrl: string;
  type: "image" | "video";
};

type Props = {
  post: GeneratedChannelPost;
  content: string;
  media?: MediaFile[];
  firstComment?: string;
  shareToFeed?: boolean;
};

export function InstagramPost({
  post,
  content,
  media = [],
  firstComment,
}: Props) {
  const format = post.format ?? "post";
  const hasMedia = media.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);

  // REEL / STORY
  if (format === "reel" || format === "story") {
    const first = media[0];
    return (
      <div className="mx-auto w-full max-w-[280px]">
        <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black shadow-xl">
          {hasMedia ? (
            first.type === "video" ? (
              <video
                src={first.previewUrl}
                className="absolute inset-0 h-full w-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <Image
                width={100}
                height={100}
                src={first.previewUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/50">
              {format === "reel" ? "Reel preview" : "Story preview"}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-16">
            <p className="text-sm font-semibold text-white">yourbrand</p>
            <p className="mt-1 line-clamp-2 text-sm text-white/90">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  // FEED POST with carousel
  return (
    <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-3 p-3">
        <div className="size-9 rounded-full bg-muted" />
        <div>
          <p className="text-sm font-semibold">yourbrand</p>
          <p className="text-xs text-muted-foreground">Original audio</p>
        </div>
      </div>

      {hasMedia && (
        <div className="relative">
          {/* Swipeable carousel */}
          <div
            className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
            onScroll={(e) => {
              const el = e.currentTarget;
              const index = Math.round(el.scrollLeft / el.clientWidth);
              setActiveIndex(index);
            }}
          >
            {media.map((m) => (
              <div
                key={m.id}
                className="relative aspect-square w-full flex-shrink-0 snap-center bg-muted"
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

          {/* Indicators */}
          {media.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {media.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-4">
          <Heart className="size-5" />
          <MessageCircle className="size-5" />
          <Send className="size-5" />
          <Bookmark className="ml-auto size-5" />
        </div>

        <p className="mt-3 text-sm font-semibold">0 likes</p>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
          <span className="mr-2 font-semibold">yourbrand</span>
          {content}
        </p>

        {firstComment && (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">yourbrand</span>{" "}
            {firstComment}
          </p>
        )}
      </div>
    </div>
  );
}
