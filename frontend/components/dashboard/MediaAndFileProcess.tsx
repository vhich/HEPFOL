import { YoutubeExtractedDataType } from "@/lib/dashboard_types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useDBcontext } from "@/providers/dashboardProvider";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

type ContentSettingsTypes = "content-style" | "content-language";

const contentStyle = [
  "Professional & Engaging",
  "Educational",
  "Conversational",
  "Bold & Viral",
  "Storytelling",
];
const contentLanguage = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "German",
];
const CustomizeContent = () => {
  const contentSettings = [
    {
      id: "content-style" as ContentSettingsTypes,
      list: contentStyle,
    },
    {
      id: "content-language" as ContentSettingsTypes,
      list: contentLanguage,
    },
  ];

  return (
    <div className="max-w-min min-w-full">
      <p className="text-muted-foreground my-3 text-sm">Customize content</p>
      <div className="flex sm:flex-row flex-col gap-6">
        {contentSettings.map((setting) => (
          <select
            key={setting.id}
            className=" border bg-accent border-border p-3 rounded-lg"
            name={setting.id}
          >
            <option className={"capitalize"} disabled>
              Select {setting.id.replace("-", " ")}
            </option>
            {setting.list.map((list) => (
              <option value={list} key={list} className="font-light">
                {list}
              </option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
};

export default CustomizeContent;

export const YoutubeData = ({
  setExtractionData,
  extractionData,
}: {
  setExtractionData: Dispatch<SetStateAction<YoutubeExtractedDataType | null>>;
  extractionData: YoutubeExtractedDataType;
}) => {
  const [saving, setSaving] = useState(false);
  const { serverUrl } = useDBcontext();
  const supabase = getSupabaseBrowserClient();
  const handleSaveYouTube = async () => {
    if (!extractionData) return;
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${serverUrl}/save-youtube`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
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
      } else {
        alert(`Save failed: ${data.error}`);
      }
    } catch {
      supabase.auth.signOut();
    } finally {
      setSaving(false);
    }
  };

  return (
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
  );
};
