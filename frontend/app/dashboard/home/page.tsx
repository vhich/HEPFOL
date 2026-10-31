"use client";

import ChooseWorkflow from "@/components/dashboard/ChooseWorkflow";
import DashboardShell from "@/components/dashboard/DashboardShell";
import GeneratePostUI from "@/components/dashboard/GeneratePostUI";
import NoChannelsCTA from "@/components/dashboard/NoChannelsCTA";
import Modal from "@/components/Modal";
import { useDBcontext } from "@/providers/dashboardProvider";
import { fadedText, headingFour, headingTwo } from "@/utils/general_styles";
import { cn } from "cn";
import Image from "next/image";

export default function CreatePage() {
  const { openModal, workFlow } = useDBcontext();
  return (
    <DashboardShell>
      <div className="mx-auto max-w-190 text-center">
        <div className="mx-auto mb-4 grid place-items-center">
          <Image
            src={"/app_logo_icon_dark.svg"}
            width={60}
            height={60}
            alt="logo icon"
          />
        </div>
        <h4 className={cn("mx-auto mt-3 max-w-162", headingFour, fadedText)}>
          Ready to multiply your reach?
        </h4>

        <h2 className={cn("mx-auto mt-3 mb-8", headingTwo)}>
          Choose your repurposing workflow
          {/* Add a YouTube video, URL, audio, video, or images. We&apos;ll
            analyze your content and transform it into platform-ready social
            assets. */}
        </h2>
        <ChooseWorkflow />
      </div>
      {openModal && (
        <Modal>
          {workFlow === "connect_channel" && <NoChannelsCTA />}{" "}
          {workFlow === "generate_post" && <GeneratePostUI />}
        </Modal>
      )}
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
    </DashboardShell>
  );
}
