"use client";

import { UploadState } from "@/hooks/use-upload";
import { UploadJob } from "@/lib/upload-api";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface UploadContextTypes {
  setState: Dispatch<SetStateAction<UploadState>>;
  setProgressMessage: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setJob: Dispatch<SetStateAction<UploadJob | null>>;
  state: UploadState;
  progressMessage: string;
  error: string | null;
  job: UploadJob | null;
}

const uploadContext = createContext<UploadContextTypes | undefined>(undefined);
export const UploadFileProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<UploadState>("idle");
  const [progressMessage, setProgressMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<UploadJob | null>(null);

  return (
    <uploadContext.Provider
      value={{
        setState,
        setProgressMessage,
        setError,
        setJob,
        state,
        progressMessage,
        error,
        job,
      }}
    >
      {children}{" "}
    </uploadContext.Provider>
  );
};

export const useUploadContext = () => {
  const context = useContext(uploadContext);
  if (!context) {
    throw new Error(
      "useUploadContext must be used within a UploadFileProvider",
    );
  }
  return context;
};
