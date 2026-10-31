import { ChannelsTypes } from "@/lib/dashboard_types";
import { useDBcontext } from "@/providers/dashboardProvider";
import { fadedText } from "@/utils/general_styles";
import { cn } from "cn";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa";
import { FaThreads, FaXTwitter } from "react-icons/fa6";
import InnerModal from "./InnerModal";

const NoChannelsCTA = () => {
  const { workFlow, openModal } = useDBcontext();
  const channels: ChannelsTypes[] = [
    {
      id: "fb_channel",
      brand: "facebook",
      icon: FaFacebook,
      description: ["page", "group"],
      icon_bg_color: "bg-blue-600",
    },
    {
      id: "tiktok_channel",
      brand: "tiktok",
      icon: FaTiktok,
      description: ["profile"],
      icon_bg_color: "bg-slate-200",
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
    <InnerModal
      isHidden={!openModal || !workFlow}
      title="Connect a Channel"
      roleDescription={`choose a channel to connect, channels includes : ${channels.map((chan) => chan.brand).join(", ")}`}
      className="sm:h-min"
    >
      <div
        className={cn(
          "grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 items-center mx-auto px-6 sm:h-full h-[80%] overflow-y-auto",
        )}
      >
        {channels.map((chan) => (
          <button
            key={chan.id}
            role="button"
            type="button"
            aria-roledescription={`Connect ${chan.id} for ${chan.description.join(", ")}`}
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
    </InnerModal>
  );
};

export default NoChannelsCTA;
