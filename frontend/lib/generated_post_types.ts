// mocks/mockRepurposeData.ts

export type SocialPlatform =
  | "facebook"
  | "tiktok"
  | "linkedin"
  | "instagram"
  | "twitter"
  | "threads";

export interface MockConnectedChannel {
  id: string;
  platform: SocialPlatform;
  account_name: string;
  external_account_id: string;
  status: "connected" | "expired" | "disconnected";
  postproxy_profile_id: string;
}
export type PostFormat = "post" | "reel" | "story";
export interface GeneratedChannelPost {
  id: string;
  platform: SocialPlatform;
  label: string;
  content: string;
  hashtags?: string[];
  hookOverlay?: string; // Useful for TikTok / Instagram Reels
  threadItems?: string[]; // Useful if rendering X / Threads as multi-part posts
  characterCount: number;
  maxCharacters: number;
  format?: PostFormat; // defaults to "post"
  mediaIncluded?: boolean;
  mediaUrls?: string[];
  status: "draft" | "scheduled" | "published" | "failed";
}

export interface MockGenerationResult {
  jobId: string;
  tone: string;
  language: string;
  durationSeconds: number;
  transcript: string;
  channels: Record<SocialPlatform, GeneratedChannelPost>;
}

// 1. Mock Connected Accounts (matches your `connected_accounts` table columns)
export const MOCK_CONNECTED_CHANNELS: MockConnectedChannel[] = [
  {
    id: "acc-01",
    platform: "linkedin",
    account_name: "Victor O.G.",
    external_account_id: "li_992817",
    status: "connected",
    postproxy_profile_id: "pp_prof_li_01",
  },
  {
    id: "acc-02",
    platform: "twitter",
    account_name: "@victor_builds",
    external_account_id: "tw_448192",
    status: "connected",
    postproxy_profile_id: "pp_prof_tw_02",
  },
  {
    id: "acc-03",
    platform: "tiktok",
    account_name: "@victorwebdev",
    external_account_id: "tt_773120",
    status: "connected",
    postproxy_profile_id: "pp_prof_tt_03",
  },
  {
    id: "acc-04",
    platform: "instagram",
    account_name: "victor.builds",
    external_account_id: "ig_550192",
    status: "expired", // Great for testing reconnect UI states
    postproxy_profile_id: "pp_prof_ig_04",
  },
  {
    id: "acc-05",
    platform: "facebook",
    account_name: "Hepfol Official Page",
    external_account_id: "fb_110293",
    status: "connected",
    postproxy_profile_id: "pp_prof_fb_05",
  },
  {
    id: "acc-06",
    platform: "threads",
    account_name: "@victor.builds",
    external_account_id: "th_882019",
    status: "connected",
    postproxy_profile_id: "pp_prof_th_06",
  },
];

// 2. Mock Transcript + Generated Channel Posts
export const MOCK_GENERATION_RESULT: MockGenerationResult = {
  jobId: "a1b2c3d4e5f60718293a4b5c6d7e8f90",
  tone: "Professional & Engaging",
  language: "English",
  durationSeconds: 74,
  transcript:
    "Most creators spend two hours recording a video and another three hours chopping it up, rewriting captions, and switching between five different tabs just to post it everywhere. That's the distribution tax. With Hepfol, you drop your raw video, audio, or screenshots once, pick your tone and channels, and get platform-native drafts ready to publish in seconds.",
  channels: {
    linkedin: {
      id: "post-li-01",
      platform: "linkedin",
      label: "LinkedIn",
      content: `Most creators spend 2 hours recording—and 3 hours formatting, rewriting, and tab-switching just to get their content online.\n\nThat's the hidden "distribution tax" killing consistency.\n\nInstead of treating every social platform like a separate manual chore:\n1. Capture your raw idea once (video, audio, or screenshots)\n2. Adapt the format natively for each audience\n3. Review, tweak, and publish from one place\n\nConsistency doesn't come from working harder on formatting. It comes from removing friction between creating and publishing.\n\nHow long does your post-production workflow take right now?`,
      hashtags: [
        "#ContentCreation",
        "#CreatorEconomy",
        "#BuildInPublic",
        "#Productivity",
      ],
      characterCount: 642,
      maxCharacters: 3000,
      mediaIncluded: true,
      status: "draft",
    },
    twitter: {
      id: "post-tw-01",
      platform: "twitter",
      label: "Twitter / X",
      content: `Creators spend 2 hours creating and 3 hours manually reformatting across 5 tabs.\n\nThat's the distribution tax.\n\nDrop your raw media once -> get platform-native posts for X, LinkedIn, TikTok & IG in seconds.\n\nCreate once. Distribute everywhere.`,
      threadItems: [
        "1/3 Creators spend 2 hours creating and 3 hours manually reformatting across 5 tabs. That's the distribution tax.",
        "2/3 Copy-pasting the exact same block of text everywhere kills reach. Every feed rewards native pacing and hooks.",
        "3/3 Drop your raw media once -> generate tailored drafts -> publish across all channels in one click.",
      ],
      characterCount: 248,
      maxCharacters: 280,
      mediaIncluded: true,
      status: "draft",
    },
    tiktok: {
      id: "post-tt-01",
      platform: "tiktok",
      label: "TikTok",
      hookOverlay: "Stop paying the 3-hour content distribution tax ⏳",
      content: `Recording takes 2 hours. Rewriting captions and switching between 5 apps takes 3 more. Here is how to turn one raw upload into ready-to-post drafts across every channel in seconds. #contentcreator #creatortips #workflow #productivity`,
      hashtags: [
        "#contentcreator",
        "#creatortips",
        "#workflow",
        "#productivity",
      ],
      characterCount: 241,
      maxCharacters: 2200,
      mediaIncluded: true,
      status: "draft",
    },
    instagram: {
      id: "post-ig-01",
      platform: "instagram",
      label: "Instagram",
      hookOverlay: "Create once. Post everywhere. 🚀",
      content: `The hardest part of content creation isn't recording—it's everything that happens after.\n\nStop spending hours rewriting the same idea for five different apps. Upload your raw clip or screenshots once and get clean, ready-to-publish posts tailored for your feed.\n\nSave this for your next content batch 📌`,
      hashtags: [
        "#ContentStrategy",
        "#CreatorWorkflow",
        "#SocialMediaTips",
        "#DigitalCreator",
      ],
      characterCount: 332,
      maxCharacters: 2200,
      mediaIncluded: true,
      status: "draft",
    },
    facebook: {
      id: "post-fb-01",
      platform: "facebook",
      label: "Facebook",
      content: `Ever finish recording a great video or capturing product screenshots, only to lose hours rewriting captions for every social platform?\n\nWe built Hepfol to eliminate that manual formatting bottleneck—so you can turn one upload into tailored posts for Facebook, LinkedIn, Instagram, TikTok, X, and Threads in seconds.\n\nWhich platform takes you the longest to write for?`,
      hashtags: ["#ContentCreators", "#SocialMediaMarketing", "#Workflow"],
      characterCount: 398,
      maxCharacters: 63206,
      mediaIncluded: true,
      status: "draft",
    },
    threads: {
      id: "post-th-01",
      platform: "threads",
      label: "Threads",
      content: `Hot take: Most creators don't have a consistency problem—they have a formatting bottleneck.\n\nSpending 3 hours chopping up and rewriting one idea across 5 apps burns you out fast. Automate the repurposing and save your energy for the actual ideas.`,
      characterCount: 254,
      maxCharacters: 500,
      mediaIncluded: true,
      status: "draft",
    },
  },
};
