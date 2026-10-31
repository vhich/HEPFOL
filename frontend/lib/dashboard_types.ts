import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { IconType } from "react-icons";

export type InputType = "audio" | "video" | "images" | "pdf";

export type MediaFile = {
  id: string;
  file: File;
  preview?: string;
};

export type WorkFlowType =
  | "generate_post"
  | "create_post"
  | "connect_channel"
  | "";

type dashboardPathsLabel = "home" | "contents" | "schedules";

type ChannelDescType =
  | "business"
  | "creator"
  | "profile"
  | "group"
  | "personal"
  | "page";

export interface UserType {
  avatar_url: string;
  email: string;
  email_verified: boolean;
  full_name: string;
  name_initials: string;
  picture: string;
  role: string | undefined;
}

export interface UploadResultTypes {
  success: boolean;
  duplicate: boolean;
  message: string;
  hash: string;
  projectId: string;
  filePath: string;
}
export interface WorkFlowTypes {
  id: WorkFlowType;
  icon: string;
  title: string;
  description: string;
}
export const FILE_LIMITS = {
  sizeMB: 30,
  videoDurationMinutes: 30,
} as const;

export interface InputTypeUITypes {
  id: InputType;
  userInterface: ReactNode;
  limit: {
    size: typeof FILE_LIMITS.sizeMB;
    duration: typeof FILE_LIMITS.videoDurationMinutes | null;
  };
  accept_file: string;
}

export interface DashboardPagePathTypes {
  id: dashboardPathsLabel;
  path: string;
  icon: LucideIcon;
}

export interface ChannelsTypes {
  id: string;
  brand: string;
  description: ChannelDescType[];
  icon: IconType;
  icon_bg_color: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface YoutubeExtractedDataType {
  extractionId: string;
  title: string;
  sizeMB: string;
}
