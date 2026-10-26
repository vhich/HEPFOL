import { cn } from "cn";

const ChooseWorkflow = () => {
  const workflow = [
    {
      id: "create_post",
      title: "Create post ✒️",
      description: "Craft a fresh platform-specific version from scratch.",
    },
    {
      id: "generate_post",
      title: "Generate post ✨",
      description: "Auto-convert your long-form content using integrated AI.",
    },
  ];
  return (
    <div className="grid sm:grid-cols-2 grid-cols-1 mx-auto gap-8 my-10">
      {workflow
        .map((work) => (
          <button
            key={work.id}
            className={`${childModeWrapper} text-left px-5.5 py-6 group hover:shadow-xl transition hover:border-2 hover:border-purple-500 hover:border-b-5 sm:hover:-translate-y-1.5 hover:translate-0`}
          >
            <h4 className={cn("group-hover:text-purple-500 ", headingFour)}>
              {work.title}
            </h4>
            <p className={cn("my-3", descriptionText)}>{work.description}</p>
          </button>
        ))
        .reverse()}
    </div>
  );
};

export default ChooseWorkflow;

export const childModeWrapper: string =
  "dark:bg-secondary bg-background border-2 border-border rounded-lg";
export const parentModeWrapper: string = "dark:bg-background bg-secondary";

const headerText = "tracking-wider";
export const headingOne: string = `${headerText} sm:text-6xl text-3xl font-medium`;
export const headingTwo: string = `${headerText} sm:text-5xl text-3xl`;
export const headingThree: string = `${headerText} sm:text-4x text-3xl`;
export const headingFour: string = `${headerText} sm:text-3xl text-2xl`;
export const headingFive: string = `${headerText} sm:text-2xl text-2xl`;
export const headingSix: string = `${headerText} sm:text-xl text-2xl font-medium`;
export const descriptionText: string =
  "text-muted-foreground text-sm tracking-wider";
export const fadedText: string = "text-muted-foreground tracking-wider";
