"use client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface UserType {
  avatar_url: string;
  email: string;
  email_verified: boolean;
  full_name: string;
  name_initials: string;
  picture: string;
  role: string | undefined;
}

interface DashboardContextType {
  setUser: Dispatch<SetStateAction<UserType>>;
  user: UserType;
}

const DBContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType>({
    avatar_url: "",
    email: "",
    email_verified: false,
    full_name: "",
    name_initials: "",
    picture: "",
    role: "",
  });

  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  useEffect(() => {
    async function getUserDetails() {
      // 1. Get the current session or user
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) return;

      const user_data = session.user.user_metadata;
      const initials = user_data?.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      setUser({
        avatar_url: user_data?.avatar_url,
        picture: user_data?.picture,
        full_name: user_data?.full_name,
        email_verified: user_data?.email_verified,
        email: user_data?.email,
        name_initials: initials,
        role: session.user?.role,
      });
      if (session.user?.role?.toLowerCase === undefined) {
        alert("You are not authenticated!");
        await supabase.auth.signOut();
      }
    }

    getUserDetails();
  }, [supabase, router]);

  return (
    <DBContext.Provider value={{ setUser, user }}>
      {" "}
      {children}
    </DBContext.Provider>
  );
};
export function useDBcontext() {
  const context = useContext(DBContext);
  if (!context) {
    throw new Error("useDBContext must be used within a DashboardProvider");
  }
  return context;
}
