"use client";
import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DashboardPage = () => {
  const supabase = createClient();

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login"); // Or redirect to your dashboard/home page
      }
    });
  }, [router, supabase]);
  return (
    <div>
      <h1>Dashboard</h1>
      <LogoutButton />
    </div>
  );
};

export default DashboardPage;
