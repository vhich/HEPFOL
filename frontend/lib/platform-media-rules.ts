export type MediaKind = "image" | "video" | "gif";

export interface PlatformMediaRule {
  maxImages: number;
  maxVideos: number;
  maxTotalMedia: number;
  maxImageSizeMB: number;
  maxVideoSizeMB: number;
  maxVideoDurationSec?: number;
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
  recommendedAspects: string[];
  notes: string[];
}

export const PLATFORM_MEDIA_RULES: Record<string, PlatformMediaRule> = {
  instagram: {
    maxImages: 20, // carousel
    maxVideos: 1, // single video or reel
    maxTotalMedia: 20,
    maxImageSizeMB: 30,
    maxVideoSizeMB: 300, // practical API limit ~300 MB for Reels
    maxVideoDurationSec: 900, // 15 min for Reels
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedVideoTypes: ["video/mp4", "video/quicktime"],
    recommendedAspects: ["1:1", "4:5", "9:16"],
    notes: [
      "Feed: 4:5 (1080×1350) preferred",
      "Reels & Stories: 9:16 (1080×1920)",
      "API image limit is tighter (JPEG ≤ 8 MB) – we warn above 8 MB",
    ],
  },
  facebook: {
    maxImages: 20,
    maxVideos: 1,
    maxTotalMedia: 20,
    maxImageSizeMB: 30,
    maxVideoSizeMB: 4000,
    maxVideoDurationSec: 5400, // practical
    allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/bmp"],
    allowedVideoTypes: ["video/mp4", "video/quicktime"],
    recommendedAspects: ["1:1", "4:5", "9:16", "16:9"],
    notes: ["Stories & Reels best at 9:16", "Feed prefers 4:5 or 1:1"],
  },
  twitter: {
    maxImages: 20, // X raised to 20 in Nov 2026
    maxVideos: 1,
    maxTotalMedia: 20,
    maxImageSizeMB: 5,
    maxVideoSizeMB: 512, // free accounts ~512 MB / 140 s
    maxVideoDurationSec: 140,
    allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    allowedVideoTypes: ["video/mp4", "video/quicktime"],
    recommendedAspects: ["16:9", "1:1", "4:5"],
    notes: ["Images ≤ 5 MB each", "Free accounts video ≤ ~2:20"],
  },
  threads: {
    maxImages: 20,
    maxVideos: 10,
    maxTotalMedia: 20,
    maxImageSizeMB: 8,
    maxVideoSizeMB: 1024,
    maxVideoDurationSec: 300, // 5 min
    allowedImageTypes: ["image/jpeg", "image/png"],
    allowedVideoTypes: ["video/mp4", "video/quicktime"],
    recommendedAspects: ["9:16", "1:1", "4:5"],
    notes: ["Images ≤ 8 MB", "Video ≤ 5 min / 1 GB"],
  },
  tiktok: {
    maxImages: 35, // photo posts
    maxVideos: 1,
    maxTotalMedia: 35,
    maxImageSizeMB: 20,
    maxVideoSizeMB: 4096,
    maxVideoDurationSec: 600, // API commonly 3–10 min
    allowedImageTypes: ["image/jpeg", "image/webp"],
    allowedVideoTypes: ["video/mp4", "video/webm", "video/quicktime"],
    recommendedAspects: ["9:16"],
    notes: ["Best: 1080×1920 9:16", "API video ≤ 4 GB / ~10 min"],
  },
  linkedin: {
    maxImages: 20,
    maxVideos: 1,
    maxTotalMedia: 20,
    maxImageSizeMB: 5,
    maxVideoSizeMB: 5120, // 5 GB
    maxVideoDurationSec: 900, // 15 min
    allowedImageTypes: ["image/jpeg", "image/png", "image/gif"],
    allowedVideoTypes: ["video/mp4", "video/quicktime", "video/webm"],
    recommendedAspects: ["1:1", "4:5", "1.91:1"],
    notes: ["Images ≤ 5 MB", "Video 3 s – 15 min"],
  },
};
