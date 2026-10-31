import { WorkFlowTypes } from "@/lib/dashboard_types";
import { useDBcontext } from "@/providers/dashboardProvider";
import {
  childModeWrapper,
  descriptionText,
  headingFive,
  headingFour,
} from "@/utils/general_styles";
import { cn } from "cn";
const ChooseWorkflow = () => {
  const { setOpenModal, setWorkFlow } = useDBcontext();
  const workFlow: WorkFlowTypes[] = [
    {
      id: "generate_post",
      icon: "✨",
      title: "Generate post",
      description: "Auto-convert your long-form content using integrated AI.",
    },
    {
      id: "create_post",
      icon: "✒️",
      title: "Create post",
      description: "Craft a fresh platform-specific version from scratch.",
    },
    {
      id: "connect_channel",
      icon: "🌐",
      title: "Connect New Channels",
      description: "Personalize your profile to make the most out of Hepfol.",
    },
  ];
  return (
    <div className="grid sm:grid-cols-3 grid-cols-1 mx-auto gap-8 my-10">
      {workFlow.map((work) => (
        <button
          key={work.id}
          type="button"
          role="button"
          aria-roledescription={work.title}
          onClick={() => {
            setOpenModal(true);
            setWorkFlow(work.id);
          }}
          className={`${childModeWrapper} text-left px-5.5 py-6 group hover:shadow-xl transition hover:border-2 hover:border-purple-500 hover:border-b-5 sm:hover:-translate-y-1.5 hover:translate-0`}
        >
          <h4 className={cn("group-hover:text-purple-500 mb-4", headingFour)}>
            {work.icon}
          </h4>
          <h5 className={cn("group-hover:text-purple-500 ", headingFive)}>
            {work.title}
          </h5>
          <p className={cn("my-3", descriptionText)}>{work.description}</p>
        </button>
      ))}
    </div>
  );
};

export default ChooseWorkflow;
