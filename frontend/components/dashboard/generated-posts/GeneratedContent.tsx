"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GeneratedChannelPost, PostFormat } from "@/lib/generated_post_types";
import { PLATFORM_MEDIA_RULES } from "@/lib/platform-media-rules";
import { cn } from "@/lib/utils";
import { useDBcontext } from "@/providers/dashboardProvider";
import { headingSix, scrollBarThin } from "@/utils/general_styles";
import { X } from "lucide-react";
import { useState } from "react";
import { channels } from "../NoChannelsCTA";
import { PostEditor } from "./PostEditor";
import { PostPreview } from "./PostPreview";

export type MediaFile = {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "video";
};

type Props = {
  posts: GeneratedChannelPost[];
};

const FORMATS: { value: PostFormat; label: string }[] = [
  { value: "post", label: "Post" },
  { value: "reel", label: "Reel" },
  { value: "story", label: "Story" },
];

export function GeneratedContent({ posts }: Props) {
  // ——— ALL HOOKS FIRST ———
  const [activePlatform, setActivePlatform] = useState(posts[0]?.platform);
  const [activeFormat, setActiveFormat] = useState<PostFormat>("post");
  const [visiblePosts, setVisiblePosts] = useState(posts);

  const [editedContent, setEditedContent] = useState<Record<string, string>>(
    () => Object.fromEntries(posts.map((p) => [p.id, p.content])),
  );

  // Global media – shared across ALL platforms
  const [sharedMedia, setSharedMedia] = useState<MediaFile[]>([]);

  const [firstComments, setFirstComments] = useState<Record<string, string>>(
    {},
  );
  const [shareToFeed, setShareToFeed] = useState<Record<string, boolean>>({});
  const { user } = useDBcontext();
  const activePost = visiblePosts.find((p) => p.platform === activePlatform);

  // ——— Early return AFTER hooks ———
  if (!activePost) return null;

  const content = editedContent[activePost.id] ?? activePost.content;
  const firstComment = firstComments[activePost.id] ?? "";
  const isShareToFeed = shareToFeed[activePost.id] ?? true;

  const showFormatTabs =
    activePost.platform === "instagram" || activePost.platform === "facebook";

  const isReel = showFormatTabs && activeFormat === "reel";
  const isPost = showFormatTabs && activeFormat === "post";
  const isStory = showFormatTabs && activeFormat === "story";

  const previewPost: GeneratedChannelPost = {
    ...activePost,
    format: showFormatTabs ? activeFormat : "post",
    mediaIncluded: sharedMedia.length > 0,
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {/* Editor + Preview – both independently scrollable */}
      <div className="grid h-full min-h-0 flex-1 grid-cols-1 overflow-hidden border-t lg:grid-cols-[60%_40%]">
        {/* LEFT – Editor */}
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <div className="flex shrink-0 gap-4 overflow-x-auto border-b p-4 pb-3 scrollbar-thin">
            {visiblePosts.map((post) => (
              <div
                key={post.id}
                onClick={() => {
                  setActivePlatform(post.platform);
                  setActiveFormat("post");
                }}
                className={cn(
                  "group relative flex shrink-0 cursor-pointer items-center gap-2",
                  post.platform === activePlatform &&
                    "rounded-full border-3 border-purple-400",
                )}
              >
                <Avatar
                  size={`${activePlatform === post.platform ? "lg" : "default"}`}
                  className="transition-all"
                >
                  <AvatarImage src={user.avatar_url || ""} alt="User Avatar" />
                  <AvatarFallback>{user.name_initials}</AvatarFallback>
                </Avatar>
                {channels.map(
                  (chan) =>
                    chan.brand
                      .toLowerCase()
                      .includes(post.platform.toLowerCase()) && (
                      <div
                        key={chan.id}
                        className={`absolute -bottom-1 -right-1 ${chan.icon_bg_color} grid h-5 w-5 place-items-center rounded-md`}
                      >
                        <chan.icon
                          size={16}
                          className={`${chan.icon_bg_color === "bg-slate-200" && "text-slate-950"}`}
                        />
                      </div>
                    ),
                )}
                <div
                  className="absolute -right-3 -top-2 opacity-0 h-6 w-6 grid place-items-center rounded-md bg-card group-hover:opacity-100 transition-opacity duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    const remainingPosts = visiblePosts.filter(
                      (p) => p.platform !== post.platform,
                    );

                    setVisiblePosts(remainingPosts);

                    if (remainingPosts.length > 0) {
                      setActivePlatform(remainingPosts[0].platform);
                    }
                  }}
                >
                  <X size={18} />
                </div>
              </div>
            ))}
          </div>

          {/* Format tabs */}
          {showFormatTabs && (
            <RadioGroup
              defaultValue={FORMATS[0].value}
              className="flex w-fit shrink-0 gap-3 rounded-lg p-4"
            >
              {FORMATS.map((f) => (
                <div
                  key={f.label}
                  onClick={() => setActiveFormat(f.value)}
                  className="flex items-center gap-1"
                >
                  <RadioGroupItem value={f.value} id={f.label} />
                  <Label htmlFor={f.label}>{f.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Scrollable Editor area */}
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 lg:p-6",
              scrollBarThin,
            )}
          >
            <PostEditor
              post={previewPost}
              value={content}
              onChange={(value) =>
                setEditedContent((c) => ({ ...c, [activePost.id]: value }))
              }
              media={sharedMedia}
              onMediaChange={setSharedMedia}
              platformRules={PLATFORM_MEDIA_RULES[activePost.platform]}
              firstComment={firstComment}
              onFirstCommentChange={(val) =>
                setFirstComments((c) => ({ ...c, [activePost.id]: val }))
              }
              shareToFeed={isShareToFeed}
              onShareToFeedChange={(val) =>
                setShareToFeed((s) => ({ ...s, [activePost.id]: val }))
              }
              showFirstComment={[
                "instagram",
                "facebook",
                "linkedin",
                "threads",
              ].includes(activePost.platform)}
              showShareToFeed={isReel}
            />
          </div>
        </div>

        {/* RIGHT – Preview */}
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-muted/30">
          <h6 className={`${headingSix} p-4 flex items-center gap-2`}>
            {activePost.label} Preview
            {showFormatTabs && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                {activeFormat}
              </span>
            )}
          </h6>
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 scrollbar-thin",
              scrollBarThin,
            )}
          >
            <PostPreview
              post={previewPost}
              content={content}
              media={sharedMedia}
              firstComment={firstComment}
              shareToFeed={isShareToFeed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
