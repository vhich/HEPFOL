"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDBcontext } from "@/providers/dashboardProvider";

export function UserAvatar() {
  const { user } = useDBcontext();

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 hover:grayscale">
      <Avatar size="lg">
        {/* Pass the fetched string URL instead of the client object */}
        <AvatarImage src={user.avatar_url || ""} alt="User Avatar" />
        <AvatarFallback>{user.name_initials}</AvatarFallback>
      </Avatar>
    </div>
  );
}
