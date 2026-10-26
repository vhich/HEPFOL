import { cn } from "cn";
import { IconType } from "react-icons";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaThreads, FaXTwitter } from "react-icons/fa6";
import {
  childModeWrapper,
  descriptionText,
  fadedText,
  headingFour,
} from "./ChooseWorkflow";

type ChannelDescType =
  | "business"
  | "creator"
  | "profile"
  | "group"
  | "personal"
  | "page";

interface ChannelsTypes {
  id: string;
  brand: string;
  description: ChannelDescType[];
  icon: IconType;
  icon_bg_color: string;
}
const NoChannelsCTA = () => {
  const channels: ChannelsTypes[] = [
    {
      id: "fb_channel",
      brand: "facebook",
      icon: FaFacebook,
      description: ["page", "group"],
      icon_bg_color: "bg-blue-600",
    },
    {
      id: "linknd_channel",
      brand: "linkedin",
      icon: FaLinkedin,
      description: ["page", "profile"],
      icon_bg_color: "bg-blue-500",
    },
    {
      id: "insta_channel",
      brand: "instagram",
      icon: FaInstagram,
      description: ["business", "personal", "creator"],
      icon_bg_color: "bg-pink-600",
    },
    {
      id: "twitter_channel",
      brand: "twitter / X",
      icon: FaXTwitter,
      description: ["profile"],
      icon_bg_color: "bg-slate-200",
    },
    {
      id: "thread_channel",
      brand: "thread",
      icon: FaThreads,
      description: ["profile"],
      icon_bg_color: "bg-slate-200",
    },
  ];
  return (
    <section className={cn("mx-auto mt-10 py-6 ", childModeWrapper)}>
      <h4 className={cn(headingFour)}>Connect a New Channel</h4>
      <p className={cn("my-4", descriptionText)}>
        Personalize your profile to make the most out of Hepfol.
      </p>
      <div
        className={cn(
          "grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 items-center mx-auto px-6",
        )}
      >
        {channels.map((chan) => (
          <button
            key={chan.id}
            className="border-border border rounded-xl text-center grid place-items-center hover:border-purple-500 hover:shadow-purple-300 shadow-sm h-full"
          >
            <div className="py-8 px-6 grid place-items-center ">
              <div
                className={`w-10 h-10 grid place-items-center rounded-md text-white ${chan.icon_bg_color} mb-4`}
              >
                <chan.icon
                  size={24}
                  className={`${chan.icon_bg_color === "bg-slate-200" && "text-slate-950"}`}
                />
              </div>
              <p className="my-1 opacity-90 capitalize">{chan.brand}</p>
              <p className={`text-sm capitalize ${fadedText}`}>
                {chan.description.join(", ")}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default NoChannelsCTA;
