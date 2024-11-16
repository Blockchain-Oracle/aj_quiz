"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy } from "lucide-react";
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
        const data = await response.json();
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
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{activity.subject}</span>
              <Badge
                variant={activity.type === "quiz" ? "default" : "secondary"}
              >
                {activity.type === "quiz" ? "Quiz" : "Practice"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {(activity.timeSpent / 60).toFixed(1)}m
              </span>
              <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {activity.type === "quiz" && (
            <div className="flex items-center gap-4">
              <Progress
                value={(activity.score! / activity.totalQuestions!) * 100}
                className="w-24"
              />
              <span className="text-sm font-medium">
                {activity.score}/{activity.totalQuestions}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
