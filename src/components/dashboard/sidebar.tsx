"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Trophy,
  Clock,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Subjects",
    href: "/dashboard/subject",
    icon: BookOpen,
  },
  {
    name: "My Quizzes",
    href: "/dashboard/subject/my-quizzes",
    icon: History,
  },
  {
    name: "Leaderboard",
    href: "/dashboard/leaderboard",
    icon: Trophy,
  },
  {
    name: "UTME",
    href: "/dashboard/subject/utme",
    icon: GraduationCap,
  },
  {
    name: "WAEC",
    href: "/dashboard/subject/waec",
    icon: GraduationCap,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r bg-background",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            <span className="font-bold">AJ Quiz</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "justify-center",
                  )}
                >
                  <item.icon
                    className={cn("h-4 w-4", !isCollapsed && "mr-2")}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>

      {!isCollapsed && (
        <div className="border-t p-4">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Study Progress</p>
              <div className="mt-2">
                <Progress value={75} />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>5.2h this week</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span>76% avg</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-t p-4">
        <div
          className={cn(
            "flex items-center gap-4",
            isCollapsed && "justify-center",
          )}
        >
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
            }}
          />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">Account</span>
              <span className="text-xs text-muted-foreground">
                Manage your account
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
