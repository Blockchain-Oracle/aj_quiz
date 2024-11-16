"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityEntry {
  id: string;
  type: "quiz" | "practice";
  subject: string;
  score?: number;
  totalQuestions?: number;
  timeSpent: number;
  createdAt: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await fetch("/api/activity");
        const data = (await response.json()) as ActivityEntry[];
        setActivities(data);
      } catch (error) {
        console.error("Failed to load activity:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No recent activity
      </p>
    );
  }

  return (
    <div className="md:space-y-4">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:block">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="min-w-[300px] snap-center rounded-lg border p-4 md:min-w-full md:snap-align-none"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{activity.subject}</span>
                  <Badge variant="default">Quiz</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {(activity.timeSpent / 60).toFixed(1)}m
                  </span>
                  <span>
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Progress
                  value={(activity.score! / activity.totalQuestions!) * 100}
                  className="w-24"
                />
                <span className="text-sm font-medium">
                  {activity?.score}/{activity?.totalQuestions}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
