"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface PopularSubject {
  name: string;
  participants: number;
  averageScore: number;
  trend: "up" | "down" | "stable";
}

export function PopularSubjects() {
  const [subjects, setSubjects] = useState<PopularSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularSubjects() {
      try {
        const response = await fetch("/api/subjects/popular");
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error("Failed to load popular subjects:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchPopularSubjects();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subjects.map((subject) => (
        <Link
          key={subject.name}
          href={`/dashboard/subject/${subject.name}`}
          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
        >
          <div className="space-y-1">
            <div className="font-medium">{subject.name}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{subject.participants} learners</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {subject.averageScore.toFixed(1)}%
              </span>
            </div>
            <Progress value={subject.averageScore} className="w-20" />
          </div>
        </Link>
      ))}
    </div>
  );
}
