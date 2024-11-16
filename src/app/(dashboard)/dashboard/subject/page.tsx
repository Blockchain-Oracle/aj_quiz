/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, GraduationCap, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { AlocQuizService } from "@/services/AlocQuizService";
import { Input } from "@/components/ui/input";

interface SubjectStats {
  name: string;
  quizzesTaken: number;
  averageScore: number;
  totalTime: number;
  lastAttempt?: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, SubjectStats>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await AlocQuizService.getSubjects();
        setSubjects(response.subjects);

        const statsResponse = await fetch("/api/quiz/stats");
        const subjectStats = (await statsResponse.json()) as Record<
          string,
          {
            name: string;
            quizzesTaken: number;
            averageScore: number;
            totalTime: number;
            lastAttempt?: string;
          }
        >;
        setStats(subjectStats);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchSubjects();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold">Loading Subjects...</h2>
          <Progress value={33} className="mx-auto w-[90%] max-w-[600px]" />
        </div>
      </div>
    );
  }

  const filteredSubjects = Object.entries(subjects).filter(([, name]) =>
    name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Subjects
          </h1>
          <p className="hidden text-sm text-muted-foreground sm:block sm:text-base">
            Choose a subject to practice or take a timed quiz
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubjects.map(([key, name]) => {
          const normalizedKey = name.toLowerCase().trim();
          const subjectStats = stats[normalizedKey] ?? {
            name,
            quizzesTaken: 0,
            averageScore: 0,
            totalTime: 0,
            lastAttempt: undefined,
          };

          if (!subjectStats) {
            console.warn(`No stats found for subject: ${name}`);
          }

          return (
            <Card key={key} className="overflow-hidden">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="break-words text-lg sm:text-xl">
                    {name}
                  </CardTitle>
                  {subjectStats && subjectStats.averageScore > 80 && (
                    <Trophy className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className="font-medium">
                      {subjectStats?.averageScore.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={subjectStats?.averageScore} />
                </div>

                <div className="flex flex-wrap justify-between gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{subjectStats?.quizzesTaken} quizzes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{subjectStats?.totalTime.toFixed(1)}h</span>
                  </div>
                </div>

                <div className="flex flex-col items-stretch justify-between gap-2 pt-4 sm:flex-row sm:items-center">
                  <Link
                    href={`/dashboard/subject/${name}`}
                    className="w-full sm:w-auto"
                  >
                    <Button className="w-full sm:w-auto">
                      Start Quiz
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Badge
                    variant="outline"
                    className="px-2 py-1 text-center text-xs"
                  >
                    {(subjectStats?.quizzesTaken ?? 0) > 0
                      ? "In Progress"
                      : "Not Started"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
