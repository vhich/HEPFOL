"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error.message);
      return;
    }

    // Redirect to the login page and clear router cache
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium text-red-400 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition"
    >
      Sign Out
    </button>
  );
}
