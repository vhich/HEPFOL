"use client";

import { GeneratedChannelPost } from "@/lib/generated_post_types";
import type { MediaFile } from "./GeneratedContent";
import { FacebookPost } from "./platforms/FacebookPost";
import { InstagramPost } from "./platforms/InstagramPost";
import { LinkedInPost } from "./platforms/LinkedInPost";
import { ThreadsPost } from "./platforms/ThreadPost";
import { TikTokPost } from "./platforms/TiktokPost";
import { TwitterPost } from "./platforms/TwitterPost";

type Props = {
  post: GeneratedChannelPost;
  content: string;
  media?: MediaFile[];
  firstComment?: string;
  shareToFeed?: boolean;
};

export function PostPreview({
  post,
  content,
  media = [],
  firstComment = "",
  shareToFeed = true,
}: Props) {
  const common = {
    post,
    content,
    media,
    firstComment,
    shareToFeed,
  };

  switch (post.platform) {
    case "instagram":
      return <InstagramPost {...common} />;
    case "facebook":
      return <FacebookPost {...common} />;
    case "twitter":
      return <TwitterPost {...common} />;
    case "linkedin":
      return <LinkedInPost {...common} />;
    case "tiktok":
      return <TikTokPost {...common} />;
    case "threads":
      return <ThreadsPost {...common} />;
    default:
      return (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
          Preview not available for this platform
        </div>
      );
  }
}
