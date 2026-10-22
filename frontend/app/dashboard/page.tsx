"use client";

import LogoutButton from "@/components/LogoutButton";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  ArrowRight,
  AudioLines,
  Check,
  CheckCircle2,
  ChevronDown,
  FileAudio,
  FileImage,
  FileVideo,
  ImagePlus,
  Loader2,
  Plus,
  Sparkles,
  TvMinimalPlay,
  Upload,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

type InputType = "youtube" | "audio" | "video" | "images";

type MediaFile = {
  id: string;
  file: File;
  preview?: string;
};

const inputTypes = [
  {
    id: "youtube" as const,
    label: "YouTube",
    icon: TvMinimalPlay,
  },
  {
    id: "audio" as const,
    label: "Audio",
    icon: AudioLines,
  },
  {
    id: "video" as const,
    label: "Video",
    icon: Video,
  },
  {
    id: "images" as const,
    label: "Images",
    icon: ImagePlus,
  },
];

export default function CreatePage() {
  const [inputType, setInputType] = useState<InputType>("youtube");
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [language, setLanguage] = useState("English");
  const [contentStyle, setContentStyle] = useState("Professional & Engaging");
  const [uploading, setUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [attempts, setAttempts] = useState<number>(0);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    duplicate: boolean;
    message: string;
    hash: string;
    projectId: string;
    filePath: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = getSupabaseBrowserClient();

  const handleFiles = (selectedFiles: FileList | File[]) => {
    const incoming = Array.from(selectedFiles);

    const validFiles = incoming.filter((file) => {
      if (inputType === "audio") {
        return file.type.startsWith("audio/");
      }

      if (inputType === "video") {
        return file.type.startsWith("video/");
      }

      if (inputType === "images") {
        return file.type.startsWith("image/");
      }

      return true;
    });

    const mapped: MediaFile[] = validFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
    }));

    setFiles((prev) => [...prev, ...mapped]);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((item) => item.id === id);

      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }

      return prev.filter((item) => item.id !== id);
    });
  };

  const handleInputTypeChange = (type: InputType) => {
    setInputType(type);
    setUrl("");
    setFiles([]);
  };

  const getAccept = () => {
    if (inputType === "audio") {
      return "audio/*";
    }

    if (inputType === "video") {
      return "video/*";
    }

    if (inputType === "images") {
      return "image/*";
    }

    return undefined;
  };

  const hasInput =
    inputType === "youtube" && url.trim() ? true : files.length > 0;

  const handleUploadAndProceed = async () => {
    if (files.length === 0) return;
    const maxAttempts = 60; // 60 attempts * 5 seconds = 5 minutes total tracking

    setUploading(true);
    setProcessingStatus("Uploading file securely...");

    const formData = new FormData();
    formData.append("file", files[0].file);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("You must be logged in to upload files.");
        setUploading(false);
        return;
      }

      // 1. Kick off upload job on the backend
      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        alert(`Upload error: ${data.error}`);
        setUploading(false);
        return;
      }

      const jobId = data.jobId;

      // 2. Short Polling loop (every 1.5 seconds)
      const pollInterval = setInterval(async () => {
        setAttempts((prev) => prev + 1);
        try {
          const statusRes = await fetch(
            `http://localhost:4000/upload-status/${jobId}`,
          );
          const statusData = await statusRes.json();

          if (statusData.status === "completed") {
            clearInterval(pollInterval);
            setUploading(false);
            setUploadResult(statusData.result);

            if (statusData.result.duplicate) {
              alert(
                `Duplicate file detected! Loaded cached project ID: ${statusData.result.projectId}`,
              );
            } else {
              alert(
                `File processed & saved successfully! Project ID: ${statusData.result.projectId}`,
              );
            }
            setFiles([]);
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval);
            setUploading(false);
            alert(`Processing failed: ${statusData.error}`);
          } else {
            // Update button label with the real-time background status message
            setProcessingStatus(statusData.progressMessage);
          }
        } catch (pollErr) {
          console.error("Polling status error:", pollErr);
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          console.error("Process timeout!");
        }
      }, 1500);
    } catch (error) {
      console.error("Upload network error:", error);
      alert("Network error connecting to backend server.");
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
      {/* Top navigation */}
      <header className="h-[72px] border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-8">
          <LogoutButton />
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-[17px] font-bold tracking-tight">
                Media2Social
              </h1>
              <p className="text-[11px] text-slate-400">
                From Long Media → Social Impact
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-sm text-slate-500 hover:text-slate-900">
              Projects
            </button>

            <button className="text-sm text-slate-500 hover:text-slate-900">
              Templates
            </button>

            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                VC
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium">Victor Chibuihe</p>
                <p className="text-xs text-slate-400">Pro Plan</p>
              </div>

              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 py-12">
        {/* Page heading */}
        <div className="mx-auto max-w-[760px] text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Turn your long-form media into social content
          </h2>

          <p className="mx-auto mt-3 max-w-[650px] text-[15px] leading-6 text-slate-500">
            Add a YouTube video, URL, audio, video, or images. We&apos;ll
            analyze your content and transform it into platform-ready social
            assets.
          </p>
        </div>

        {/* Main card */}
        <section className="mx-auto mt-10 max-w-[980px] rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          {/* Step indicator */}
          <div className="mb-8 flex items-center justify-center">
            <Step number="1" label="Add Media" active />
            <StepConnector />
            <Step number="2" label="Customize" />
            <StepConnector />
            <Step number="3" label="Generate" />
          </div>

          {/* Input tabs */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-2 sm:grid-cols-4">
            {inputTypes.map((item) => {
              const Icon = item.icon;
              const active = inputType === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleInputTypeChange(item.id)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:bg-white/70 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-[18px] w-4.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Input content */}
          <div className="mt-7">
            {inputType === "youtube" && (
              <UrlInput type={inputType} value={url} onChange={setUrl} />
            )}

            {(inputType === "audio" ||
              inputType === "video" ||
              inputType === "images") && (
              <UploadArea
                type={inputType}
                files={files}
                isDragging={isDragging}
                accept={getAccept()}
                fileInputRef={fileInputRef}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                onBrowse={() => fileInputRef.current?.click()}
                onChange={handleFileChange}
                onRemove={removeFile}
              />
            )}
          </div>

          {/* Supported formats */}
          <p className="mt-4 text-center text-xs text-slate-400">
            {inputType === "youtube" && "Paste any public YouTube video URL"}
            {inputType === "audio" && "MP3, WAV, M4A, AAC, OGG • Up to 2GB"}
            {inputType === "video" && "MP4, MOV, AVI, WebM • Up to 2GB"}
            {inputType === "images" &&
              "JPG, PNG, WEBP • Multiple images supported"}
          </p>

          {/* Settings */}
          <div className="mt-8 border-t border-slate-100 pt-7">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Content settings
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Tell the AI how you want your content transformed.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
                Optional
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Language"
                value={language}
                options={[
                  "English",
                  "French",
                  "Spanish",
                  "Portuguese",
                  "German",
                ]}
                onChange={setLanguage}
              />

              <SelectField
                label="Content style"
                value={contentStyle}
                options={[
                  "Professional & Engaging",
                  "Educational",
                  "Conversational",
                  "Bold & Viral",
                  "Storytelling",
                ]}
                onChange={setContentStyle}
              />
            </div>
          </div>

          {/* Platforms */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Target platforms</h3>
              <p className="mt-1 text-xs text-slate-400">
                Choose where your generated content will be optimized.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                "TikTok",
                "Instagram",
                "YouTube",
                "LinkedIn",
                "Facebook",
                "X",
              ].map((platform) => (
                <label
                  key={platform}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-300"
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  {platform}
                </label>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
                <Check className="h-3 w-3 text-emerald-600" />
              </div>
              Your media is processed securely
            </div>

            <button
              onClick={handleUploadAndProceed}
              disabled={!hasInput || uploading}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{processingStatus}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Continue</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Bottom information */}
        <div className="mx-auto mt-8 flex max-w-245 flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-400">
          <span>AI transcription</span>
          <span>•</span>
          <span>Custom AI prompts</span>
          <span>•</span>
          <span>Multi-platform optimization</span>
          <span>•</span>
          <span>Automatic asset generation</span>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function Step({
  number,
  label,
  active = false,
}: {
  number: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
          active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
        }`}
      >
        {number}
      </div>

      <span
        className={`text-xs font-medium ${
          active ? "text-slate-900" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function StepConnector() {
  return <div className="mx-3 hidden h-px w-12 bg-slate-200 sm:block" />;
}

function UrlInput({
  value,
  onChange,
}: {
  type: "youtube" | "url";
  value: string;
  onChange: (value: string) => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [saving, setSaving] = useState(false);

  // State to hold data between Step 1 and Step 2
  const [extractionData, setExtractionData] = useState<{
    extractionId: string;
    title: string;
    sizeMB: string;
  } | null>(null);

  const supabase = getSupabaseBrowserClient();

  // --- STEP 1: Process and Extract Audio ---
  const handleProcessYouTube = async () => {
    if (!value.trim()) return;

    setProcessing(true);
    setStatusText("Starting job...");

    try {
      // 1. Kick off job
      const res = await fetch("http://localhost:4000/process-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.error);
        setProcessing(false);
        return;
      }

      const jobId = data.jobId;

      // 2. Short Polling loop (every 1.5 seconds)
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `http://localhost:4000/job-status/${jobId}`,
          );
          const statusData = await statusRes.json();

          if (statusData.status === "completed") {
            clearInterval(pollInterval);
            setExtractionData(statusData.result);
            setProcessing(false);
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval);
            alert(`Extraction failed: ${statusData.error}`);
            setProcessing(false);
          } else {
            // Update live status message dynamically
            setStatusText(statusData.progressMessage);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 1500);
    } catch (error) {
      console.error("Process error:", error);
      setProcessing(false);
    }
  };

  const handleSaveYouTube = async () => {
    if (!extractionData) return;
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in.");
        setSaving(false);
        return;
      }

      const response = await fetch("http://localhost:4000/save-youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ extractionId: extractionData.extractionId }),
      });

      const data = await response.json();
      if (data.success) {
        alert(
          data.duplicate
            ? "Duplicate media loaded!"
            : "Project saved successfully!",
        );
        setExtractionData(null);
        onChange("");
      } else {
        alert(`Save failed: ${data.error}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-100">
          <TvMinimalPlay className="h-5 w-5 text-red-500" />
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="h-14 min-w-0 flex-1 px-4 text-sm outline-none"
          disabled={processing || saving || extractionData !== null}
        />
        {!extractionData && (
          <button
            disabled={!value.trim() || processing}
            onClick={handleProcessYouTube}
            className="m-1.5 flex items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400"
          >
            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
            {processing ? statusText : "Process & Extract Audio"}
          </button>
        )}
      </div>

      {extractionData && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                  Ready ({extractionData.sizeMB} MB)
                </span>
                <h4 className="mt-1 font-semibold text-slate-900">
                  {extractionData.title}
                </h4>
              </div>
            </div>
            <button
              disabled={saving}
              onClick={handleSaveYouTube}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {saving ? "Saving..." : "Save & Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadArea({
  type,
  files,
  isDragging,
  accept,
  fileInputRef,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onBrowse,
  onChange,
  onRemove,
}: {
  type: "audio" | "video" | "images";
  files: MediaFile[];
  isDragging: boolean;
  accept?: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onBrowse: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
}) {
  const isImages = type === "images";

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept={accept}
        multiple={isImages}
        onChange={onChange}
      />
      {files.length > 0 ? null : (
        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={onBrowse}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30"
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Upload className="h-6 w-6 text-blue-600" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">
            Drag & drop your {isImages ? "images" : type} here
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            or click to browse from your device
          </p>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onBrowse();
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Select {isImages ? "Images" : "File"}
          </button>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">
              Selected media
            </p>

            <span className="text-xs text-slate-400">
              {files.length} file{files.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {files.map((item) => (
              <FilePreview
                key={item.id}
                item={item}
                onRemove={() => onRemove(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilePreview({
  item,
  onRemove,
}: {
  item: MediaFile;
  onRemove: () => void;
}) {
  const file = item.file;

  let Icon = FileImage;

  if (file.type.startsWith("audio/")) {
    Icon = FileAudio;
  } else if (file.type.startsWith("video/")) {
    Icon = FileVideo;
  }

  return (
    <div className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5">
      {item.preview ? (
        <Image
          width={100}
          height={100}
          src={item.preview}
          alt={file.name}
          className="h-16 w-16 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-50">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-800">
          {file.name}
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-slate-600">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}
