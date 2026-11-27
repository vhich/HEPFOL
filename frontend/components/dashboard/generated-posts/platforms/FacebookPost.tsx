"use client";

import { GeneratedChannelPost } from "@/lib/generated_post_types";
import { MessageCircle, MoreHorizontal, Share2, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { MediaFile } from "../GeneratedContent";

type Props = {
  post: GeneratedChannelPost;
  content: string;
  media?: MediaFile[];
  firstComment?: string;
  shareToFeed?: boolean;
};

export function FacebookPost({
  post,
  content,
  media = [],
  firstComment,
}: Props) {
  const format = post.format ?? "post";
  const hasMedia = media.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);

  // STORY
  if (format === "story") {
    const first = media[0];
    return (
      <div className="mx-auto w-full max-w-[280px]">
        <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-gradient-to-b from-blue-600 to-blue-900 shadow-xl">
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
                src={first.previewUrl}
                width={100}
                height={100}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )
          ) : null}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 p-3">
            <div className="size-9 rounded-full bg-white/20 ring-2 ring-white" />
            <div>
              <p className="text-sm font-semibold text-white">Your Page</p>
              <p className="text-[11px] text-white/70">Just now</p>
            </div>
          </div>
          {!hasMedia && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-white/60">Story preview</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // REEL
  if (format === "reel") {
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
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-white/50">Reel preview</span>
            </div>
          )}
          <div className="absolute bottom-4 left-3 right-12 z-10">
            <p className="text-sm font-semibold text-white">Your Page</p>
            <p className="mt-1 line-clamp-3 text-sm text-white/90">{content}</p>
          </div>
          <div className="absolute bottom-6 right-3 flex flex-col items-center gap-4 text-white">
            <ThumbsUp className="size-6" />
            <MessageCircle className="size-6" />
            <Share2 className="size-6" />
          </div>
        </div>
      </div>
    );
  }

  // FEED POST
  return (
    <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-3 p-3">
        <div className="size-10 rounded-full bg-muted" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Your Page</p>
          <p className="text-xs text-muted-foreground">Just now · 🌎</p>
        </div>
        <MoreHorizontal className="size-5 text-muted-foreground" />
      </div>

      <div className="whitespace-pre-wrap px-3 pb-3 text-[15px] leading-5">
        {content}
      </div>

      {hasMedia && (
        <div className="relative">
          <div
            className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
            onScroll={(e) => {
              const el = e.currentTarget;
              setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
            }}
          >
            {media.map((m) => (
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
          {media.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {media.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="border-t px-3 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>👍 24</span>
          <span>6 comments · 2 shares</span>
        </div>
      </div>

      <div className="flex items-center justify-around border-t py-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2 font-medium">
          <ThumbsUp className="size-4" /> Like
        </span>
        <span className="flex items-center gap-2 font-medium">
          <MessageCircle className="size-4" /> Comment
        </span>
        <span className="flex items-center gap-2 font-medium">
          <Share2 className="size-4" /> Share
        </span>
      </div>

      {firstComment && (
        <div className="border-t px-3 py-2 text-sm">
          <span className="font-semibold">Your Page</span> {firstComment}
        </div>
      )}
    </div>
  );
}
