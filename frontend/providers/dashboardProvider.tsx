"use client";
// import { inputTabs } from "@/components/dashboard/UploadTabs";
import {
  FileValidationResult,
  InputType,
  MediaFile,
  UploadResultTypes,
  UserType,
  WorkFlowType,
} from "@/lib/dashboard_types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface DashboardContextType {
  setUser: Dispatch<SetStateAction<UserType>>;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setWorkFlow: Dispatch<SetStateAction<WorkFlowType>>;
  setInputType: Dispatch<SetStateAction<InputType>>;
  setUrl: Dispatch<SetStateAction<string>>;
  setFiles: Dispatch<SetStateAction<MediaFile[]>>;
  setIsDragging: Dispatch<SetStateAction<boolean>>;
  setLanguage: Dispatch<SetStateAction<string>>;
  setContentStyle: Dispatch<SetStateAction<string>>;
  setUploading: Dispatch<SetStateAction<boolean>>;
  setProcessingStatus: Dispatch<SetStateAction<string>>;
  setAttempts: Dispatch<SetStateAction<number>>;
  setUploadResult: Dispatch<SetStateAction<UploadResultTypes | null>>; //Response from server
  setUploadError: Dispatch<SetStateAction<FileValidationResult | undefined>>; //CLient side upload error response
  uploadError: FileValidationResult | undefined;
  user: UserType;
  openModal: boolean;
  workFlow: WorkFlowType;
  inputType: InputType;
  url: string;
  files: MediaFile[];
  isDragging: boolean;
  language: string;
  contentStyle: string;
  uploading: boolean;
  processingStatus: string;
  attempts: number;
  uploadResult: UploadResultTypes | null;
  serverUrl: string;
  removeFileandUrl: () => void;
}

const DBContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [workFlow, setWorkFlow] = useState<WorkFlowType>("");
  const [inputType, setInputType] = useState<InputType>("audio");
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [language, setLanguage] = useState("English");
  const [contentStyle, setContentStyle] = useState("Professional & Engaging");
  const [uploading, setUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [attempts, setAttempts] = useState<number>(0);
  const [uploadError, setUploadError] = useState<FileValidationResult>();
  const [uploadResult, setUploadResult] = useState<UploadResultTypes | null>(
    null,
  );
  const [user, setUser] = useState<UserType>({
    avatar_url: "",
    email: "",
    email_verified: false,
    full_name: "",
    name_initials: "",
    picture: "",
    role: "",
  });

  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  useEffect(() => {
    async function getUserDetails() {
      // 1. Get the current session or user
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) return;

      const user_data = session.user.user_metadata;
      const initials = user_data?.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      setUser({
        avatar_url: user_data?.avatar_url,
        picture: user_data?.picture,
        full_name: user_data?.full_name,
        email_verified: user_data?.email_verified,
        email: user_data?.email,
        name_initials: initials,
        role: session.user?.role,
      });
      if (session.user?.role?.toLowerCase === undefined) {
        alert("You are not authenticated!");
        await supabase.auth.signOut();
      }
    }

    getUserDetails();
  }, [supabase, router]);

  useEffect(() => {
    if (openModal) document.body.style.overflowY = "hidden";
    else document.body.style.overflowY = "auto";
  }, [openModal]);

  function removeFileandUrl() {
    setFiles([]);
    setUrl("");
    setInputType(inputType);
  }
  const serverUrl = process.env.SERVER_BASE_URL || "http://localhost:4000";
  return (
    <DBContext.Provider
      value={{
        setUser,
        setOpenModal,
        setWorkFlow,
        setInputType,
        setUrl,
        setIsDragging,
        setLanguage,
        setContentStyle,
        setUploading,
        setProcessingStatus,
        setAttempts,
        setUploadResult,
        setUploadError,
        setFiles,
        user,
        openModal,
        workFlow,
        inputType,
        url,
        files,
        isDragging,
        language,
        contentStyle,
        uploading,
        processingStatus,
        attempts,
        uploadResult,
        uploadError,
        serverUrl,
        removeFileandUrl,
      }}
    >
      {" "}
      {children}
    </DBContext.Provider>
  );
};
export function useDBcontext() {
  const context = useContext(DBContext);
  if (!context) {
    throw new Error("useDBContext must be used within a DashboardProvider");
  }
  return context;
}
