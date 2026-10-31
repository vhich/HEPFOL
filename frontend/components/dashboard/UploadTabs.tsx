import { InputType } from "@/lib/dashboard_types";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

import { useDBcontext } from "@/providers/dashboardProvider";
import { cn } from "cn";
import { AudioLines, File, ImagePlus, LucideIcon, Video } from "lucide-react";
import { IconType } from "react-icons";

export const inputTabs = [
  //   {
  //     id: "youtube" as InputType,
  //     label: "YouTube",
  //     icon: FiYoutube as IconType,
  //   },
  {
    id: "audio" as InputType,
    label: "Audio",
    icon: AudioLines as LucideIcon,
  },
  {
    id: "video" as InputType,
    label: "Video",
    icon: Video as LucideIcon,
  },
  {
    id: "images" as InputType,
    label: "Images",
    icon: ImagePlus as LucideIcon,
  },
  {
    id: "pdf" as InputType,
    label: "PDF",
    icon: File as IconType,
  },
];

const UploadTabs = () => {
  const { setInputType, setUrl, setFiles, inputType, setUploadError } =
    useDBcontext();
  const handleInputTypeChange = (type: InputType) => {
    setInputType(type);
    setUrl("");
    setFiles([]);
    setUploadError(undefined);
  };

  return (
    <div className="mx-auto grid mb-6">
      <Tabs defaultValue={true} className={"sm:h-10 h-fit w-full"}>
        <TabsList
          className={
            "gap-3 dark:bg-transparent bg-secondary flex-wrap border border-border group-data-horizontal/tabs:h-full group-data-vertical/tabs:h-fit sm:flex grid grid-cols-2 w-full"
          }
        >
          {inputTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              id={tab.id}
              aria-roledescription={`tab`}
              aria-current={inputType === "video"}
              aria-description={`You have selected the ${inputType} tab`}
              onClick={() => handleInputTypeChange(tab.id)}
              className={cn(
                "border-0 px-7 sm:h-full h-12 sm:justify-center justify-self-start shadow-none",
                `${tab.id === inputType && "bg-background text-foreground dark:border-input dark:bg-input/30 dark:text-foreground shadow-md"}`,
              )}
            >
              <tab.icon />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default UploadTabs;
