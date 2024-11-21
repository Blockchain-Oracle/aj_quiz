"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface QuizHistory {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  createdAt: string;
}

export default function MyQuizzes() {
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch("/api/quiz/history");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = (await response.json()) as QuizHistory[];
        setHistory(data);
      } catch (error) {
        toast.error("Failed to load quiz history");
      } finally {
        setLoading(false);
      }
    }

    void fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Quizzes</h1>
        <p className="text-muted-foreground">
          View your quiz history and progress
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {history.length > 0
                ? `${(
                    history.reduce(
                      (acc, quiz) =>
                        acc + (quiz.score / quiz.totalQuestions) * 100,
                      0,
                    ) / history.length || 0
                  ).toFixed(1)}%`
                : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                history.reduce((acc, quiz) => acc + Number(quiz.timeSpent), 0) /
                60
              ).toFixed(1)}
              h
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz History</CardTitle>
        </CardHeader>
        <CardContent className="md:space-y-4">
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No quizzes taken yet
            </p>
          ) : (
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:block">
              {history.map((quiz) => (
                <div
                  key={quiz.id}
                  className="min-w-[300px] snap-center rounded-lg border p-4 md:min-w-full md:snap-align-none"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="space-y-1">
                      <p className="font-medium">{quiz.subject}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {(quiz.timeSpent / 60).toFixed(1)}m
                        </span>
                        <span>
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress
                        value={(quiz.score / quiz.totalQuestions) * 100}
                        className="w-24"
                      />
                      <Badge variant="outline">
                        {quiz.score}/{quiz.totalQuestions}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
