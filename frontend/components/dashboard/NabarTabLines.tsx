import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardPagePathTypes } from "@/lib/dashboard_types";
import { cn } from "cn";
import { Calendar, Home, SquareText } from "lucide-react";
import Link from "next/link";
export function NavbarTablines() {
  const defaultUrl = `/dashboard`;

  const dashboardPagePaths: DashboardPagePathTypes[] = [
    { id: "home", path: `${defaultUrl}/home`, icon: Home },
    { id: "contents", path: `${defaultUrl}/contents`, icon: SquareText },
    { id: "schedules", path: `${defaultUrl}/schedules`, icon: Calendar },
  ];
  return (
    <Tabs defaultValue={true}>
      <TabsList className={"gap-3 bg-transparent"}>
        {dashboardPagePaths.map((path) => (
          <TabsTrigger
            key={path.path}
            value={path.id}
            id={path.id}
            className={cn("border-0 p-7")}
          >
            <Link
              href={path.path}
              className="capitalize flex gap-1.5 items-center"
            >
              <path.icon /> {path.id}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
