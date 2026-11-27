"use client";

import { GeneratedChannelPost } from "@/lib/generated_post_types";
import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";
import type { MediaFile } from "../GeneratedContent";

type Props = {
  post: GeneratedChannelPost;
  content: string;
  media?: MediaFile[];
  firstComment?: string;
};

export function TikTokPost({ post, content, media = [] }: Props) {
  const hasMedia = media.length > 0;
  const first = media[0];

  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black text-white shadow-xl">
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
            <span className="text-sm text-white/60">Video preview</span>
          </div>
        )}

        {post.hookOverlay && (
          <div className="absolute inset-x-5 top-10 z-10 rounded-lg bg-black/60 px-4 py-3 text-center text-sm font-semibold">
            {post.hookOverlay}
          </div>
        )}

        <div className="absolute bottom-5 left-4 right-14 z-10">
          <p className="text-sm font-semibold">@yourbrand</p>
          <p className="mt-2 line-clamp-3 text-sm leading-5">{content}</p>
        </div>

        <div className="absolute bottom-6 right-3 z-10 flex flex-col items-center gap-5">
          <Heart className="size-6" />
          <MessageCircle className="size-6" />
          <Bookmark className="size-6" />
          <Share2 className="size-6" />
        </div>
      </div>
    </div>
  );
}
