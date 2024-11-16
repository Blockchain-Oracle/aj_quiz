"use client";

import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, GraduationCap, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PopularSubjects } from "@/components/dashboard/popular-subjects";
import { RecentActivity } from "@/components/dashboard/recent-activity";

interface DashboardStats {
  totalQuizzes: number;
  quizzesLastWeek: number;
  quizChange: number;
  averageScore: number;
  studyTime: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/dashboard/stats");
        const data = (await response.json()) as {
          totalQuizzes: number;
          quizzesLastWeek: number;
          quizChange: number;
          averageScore: number;
          studyTime: number;
        };
        console.log(data);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchStats();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="hidden text-muted-foreground sm:block">
          Welcome to your learning dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Subjects
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">17</div>
            <p className="text-xs text-muted-foreground">
              Subjects to learn from
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalQuizzes ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.quizChange && stats.quizChange >= 0 ? (
                <span className="text-green-500">
                  +{stats?.quizChange}% from last week
                </span>
              ) : (
                <span className="text-red-500">
                  {stats?.quizChange}% from last week
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageScore ?? 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.studyTime ?? 0}h</div>
            <p className="text-xs text-muted-foreground">
              Today&apos;s study time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-7">
        <div className="w-full md:col-span-4">
          <div className="flex snap-x snap-mandatory gap-4 pb-4 md:block">
            <Card className="min-w-[300px] snap-center md:min-w-full">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading activity...</div>}>
                  <RecentActivity />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="w-full md:col-span-3">
          <div className="flex snap-x snap-mandatory gap-4 pb-4 md:block">
            <Card className="min-w-[300px] snap-center md:min-w-full">
              <CardHeader>
                <CardTitle>Popular Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading subjects...</div>}>
                  <PopularSubjects />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="mt-1 h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
