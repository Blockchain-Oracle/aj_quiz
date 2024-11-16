"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Clock, GamepadIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface LeaderboardEntry {
  userId: string;
  username: string | null;
  totalQuizzes: number;
  averageScore: number;
  totalTime: number;
}

type SubjectLeaderboard = Record<string, LeaderboardEntry[]>;

export default function LeaderboardPage() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);

  const [subjectLeaderboard, setSubjectLeaderboard] =
    useState<SubjectLeaderboard>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const [globalResponse, subjectResponse] = await Promise.all([
          fetch("/api/leaderboard/global"),
          fetch("/api/leaderboard/subjects"),
        ]);

        const globalData = (await globalResponse.json()) as {
          userId: string;
          username: string | null;
          totalQuizzes: number;
          averageScore: number;
          totalTime: number;
        }[];
        const subjectData = (await subjectResponse.json()) as Record<
          string,
          {
            userId: string;
            username: string | null;
            totalQuizzes: number;
            averageScore: number;
            totalTime: number;
          }[]
        >;

        setGlobalLeaderboard(globalData);
        setSubjectLeaderboard(subjectData);
      } catch (error) {
        console.error("Failed to load leaderboard data:", error);
        toast.error("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    }

    void fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const topThree = globalLeaderboard.slice(0, 3);
  const subjects = Object.keys(subjectLeaderboard);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you rank against other learners
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {topThree.map((entry, index) => (
          <Card key={entry.userId} className="relative overflow-hidden">
            <div className="absolute right-2 top-2">
              {index === 0 && <Trophy className="h-6 w-6 text-yellow-500" />}
              {index === 1 && <Medal className="h-6 w-6 text-gray-400" />}
              {index === 2 && <Medal className="h-6 w-6 text-amber-700" />}
            </div>
            <CardHeader>
              <CardTitle className="text-lg">
                #{index + 1} {entry.username}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Score</span>
                <span className="font-medium">{entry.averageScore}%</span>
              </div>
              <Progress value={entry.averageScore} />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{entry.totalTime}h spent learning</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList>
          <TabsTrigger value="global">Global Rankings</TabsTrigger>
          {subjects.map((subject) => (
            <TabsTrigger key={subject} value={subject}>
              {subject}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="global">
          <LeaderboardTable entries={globalLeaderboard} />
        </TabsContent>

        {subjects.map((subject) => (
          <TabsContent key={subject} value={subject}>
            <LeaderboardTable entries={subjectLeaderboard[subject]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
function LeaderboardTable({ entries }: { entries?: LeaderboardEntry[] }) {
  if (!entries || entries.length === 0) {
    return (
      <Card className="border-none bg-gradient-to-br from-gray-900 to-gray-800">
        <CardContent className="p-8 text-center text-gray-400">
          <Trophy className="mx-auto mb-4 h-12 w-12 opacity-20" />
          No entries found
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-gradient-to-br from-gray-900 to-gray-800">
      <CardContent className="p-6">
        {entries.map((entry, index) => (
          <div
            key={entry.userId}
            className="group relative mb-4 flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 transition-all last:mb-0 hover:from-gray-800 hover:to-gray-900"
          >
            {/* Position indicator */}
            <div className="absolute -left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800 shadow-lg">
              <span className="text-sm font-bold text-gray-300">
                {index + 1}
              </span>
            </div>

            {/* Left section */}
            <div className="flex items-center gap-6 space-x-3 pl-8">
              {index === 0 && (
                <div className="absolute left-6 grid -translate-y-1/2 transform animate-bounce place-content-center">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
              )}
              <div>
                <p className="text-lg font-bold text-gray-100 transition-colors group-hover:text-white">
                  {entry.username}
                </p>
                <div className="flex items-center gap-2 text-gray-400">
                  <GamepadIcon className="h-4 w-4" />
                  <span className="text-sm">
                    {entry.totalQuizzes} quizzes completed
                  </span>
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-6">
              <div className="w-40">
                <Progress
                  value={entry.averageScore}
                  className="h-3 bg-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600"
                />
              </div>
              <Badge className="border-none bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 text-white">
                {entry.averageScore}%
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
