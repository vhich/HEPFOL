import { YoutubeExtractedDataType } from "@/lib/dashboard_types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useDBcontext } from "@/providers/dashboardProvider";
import { cn } from "cn";
import { ChangeEvent, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { toast } from "../ui/toast";

const youtubeRegex =
  /^(?:https?:)?\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_\-]{11})(?:\S+)?$/;

const YoutubeInput = () => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");

  // State to hold data between Step 1 and Step 2
  const [extractionData, setExtractionData] =
    useState<YoutubeExtractedDataType | null>(null);

  const { url, setUrl, serverUrl } = useDBcontext();

  const handleUrlInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    if (!youtubeRegex.test(value) && value.length > 0) {
      setErrorMessage("Invalid youtube link");
    } else {
      setErrorMessage("");
    }
  };

  const handleProcessYouTube = async (value: string) => {
    if (!value.trim()) return;

    setProcessing(true);
    setStatusText("Starting job...");

    try {
      // 1. Kick off job
      const res = await fetch(`${serverUrl}/process-youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.add({
          title: "An error occured",
          description: data.error,
        });
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
            toast.add({
              title: "Extraction failed",
              description: statusData.error,
            });
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
      supabase.auth.signOut();
      console.error("Process error:", error);
      setProcessing(false);
    }
  };

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const autoProcessYoutube = async () => {
      if (youtubeRegex.test(url)) await handleProcessYouTube(url);
    };
    autoProcessYoutube();
  }, [url]);
  return (
    <div className="w-full">
      {processing ? (
        <h4>{statusText}</h4>
      ) : (
        <>
          <Input
            aria-invalid={errorMessage != ""}
            aria-errormessage={errorMessage}
            aria-roledescription="youtube input"
            className={cn(
              "w-full h-10",
              `${errorMessage && "ring-destructive"}`,
            )}
            placeholder="https://youtube.com/watch?v=..."
            name="youtube"
            id="youtube"
            onChange={(e) => handleUrlInput(e)}
            value={url}
          />{" "}
          <div
            className={cn(
              "h-0 flex items-center my-3 transition-all",
              `${errorMessage && "h-3"}`,
            )}
          >
            <small
              aria-errormessage={errorMessage}
              className={cn(
                "text-destructive opacity-0",
                `${errorMessage && "opacity-90"}`,
              )}
            >
              {errorMessage ? errorMessage : "error message hidden"}
            </small>
          </div>
        </>
      )}
      {/* https://youtu.be/UWCvbwo9IRk?si=4LgY--i2x671vRaq */}
    </div>
  );
};

export default YoutubeInput;
