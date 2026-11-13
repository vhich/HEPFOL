import { YoutubeExtractedDataType } from "@/lib/dashboard_types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useDBcontext } from "@/providers/dashboardProvider";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";

type ContentSettingsTypes = "content-style" | "content-language";

const contentStyles = [
  "Professional & Engaging",
  "Educational",
  "Conversational",
  "Bold & Viral",
  "Storytelling",
];
const contentLanguages = [
  "English",
  "Pidgin English",
  "French",
  "Spanish",
  "Portuguese",
  "German",
  "french",
  "Hausa",
  "Igbo",
  "Yoruba",
];
const CustomizeContent = () => {
  const [contentStyle, setContentStyle] = useState<string>("");
  const [contentLanguage, setContentLanguage] = useState<string>("");
  const contentSettings = [
    {
      id: "content-style" as ContentSettingsTypes,
      list: contentStyles,
    },
    {
      id: "content-language" as ContentSettingsTypes,
      list: contentLanguages,
    },
  ];

  const setContentSettingValue = (
    e: ChangeEvent<HTMLSelectElement>,
    setting: ContentSettingsTypes,
  ) => {
    if (setting === "content-language") {
      setContentLanguage(e.target.value);
    } else if (setting === "content-style") {
      setContentStyle(e.target.value);
    }
  };

  return (
    <div className="w-md max-w-full">
      <p className="text-muted-foreground my-3 text-sm">Customize content</p>
      <div className="flex flex-col gap-6">
        {contentSettings.map((setting) => (
          <select
            key={setting.id}
            className=" border bg-accent border-border p-3 rounded-lg text-sm"
            name={setting.id}
            value={
              setting.id === "content-language" ? contentLanguage : contentStyle
            }
            onChange={(e) => setContentSettingValue(e, setting.id)}
          >
            <option className={"capitalize text-sm"} disabled>
              Select {setting.id.replace("-", " ")}
            </option>
            {setting.list.map((list) => (
              <option value={list} key={list} className="capitalize text-sm">
                {list}
              </option>
            ))}
          </select>
        ))}
        {/* <>
          {contentSettings.map((setting) => (
            <div key={setting.id} className="flex flex-col gap-y-2">
              {setting.list.map((list) => (
                <RadioGroupChoiceCard
                  key={list}
                  value={list}
                  selectedValue={
                    setting.id === "content-language"
                      ? contentLanguage
                      : contentStyle
                  }
                  setValue={(list) => {
                    setContentLanguageValue(list);
                    setContentStyleValue(list);
                  }}
                />
              ))}
            </div>
          ))}
        </> */}
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
