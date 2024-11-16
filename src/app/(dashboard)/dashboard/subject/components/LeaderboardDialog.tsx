"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  attempts: number;
  lastAttempt: string;
}

interface LeaderboardProps {
  subject: string;
  subjectName: string;
  entries: LeaderboardEntry[];
}

export function LeaderboardDialog({
  subject,
  subjectName,
  entries,
}: LeaderboardProps) {
  const sortedEntries = entries.sort(
    (a, b) => b.score / b.totalQuestions - a.score / a.totalQuestions,
  );
  const topThree = sortedEntries.slice(0, 3);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trophy className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {subjectName} Leaderboard
          </DialogTitle>
        </DialogHeader>

        {/* Top 3 Performers */}
        <div className="grid grid-cols-3 gap-4">
          {topThree.map((entry, index) => (
            <Card key={entry.userId} className="relative overflow-hidden">
              <div className="absolute right-2 top-2">
                {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                {index === 2 && <Medal className="h-5 w-5 text-amber-700" />}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{entry.username}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span className="font-medium">
                      {((entry.score / entry.totalQuestions) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={(entry.score / entry.totalQuestions) * 100}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <Badge variant="outline">{entry.attempts} attempts</Badge>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{(entry.timeSpent / 60).toFixed(1)}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>All Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedEntries.map((entry, index) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span>{entry.username}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress
                      value={(entry.score / entry.totalQuestions) * 100}
                      className="w-24"
                    />
                    <span className="text-sm">
                      {((entry.score / entry.totalQuestions) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
