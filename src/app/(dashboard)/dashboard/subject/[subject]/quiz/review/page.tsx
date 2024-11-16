"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface QuizReview {
  subject: string;
  questions: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
    isCorrect: boolean;
  }[];
  score: number;
  totalQuestions: number;
  timeSpent: number;
  createdAt: string;
}

export default function QuizReviewPage() {
  const { quizId } = useParams();
  const [review, setReview] = useState<QuizReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReview() {
      try {
        const response = await fetch(`/api/quiz/review/${quizId}`);
        const data = await response.json();
        setReview(data);
      } catch (error) {
        toast.error("Failed to load quiz review");
      } finally {
        setLoading(false);
      }
    }

    void fetchReview();
  }, [quizId]);

  if (loading || !review) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Quiz Review</h1>
        <p className="text-muted-foreground">
          Review your answers and learn from mistakes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium">Score</p>
            <p className="text-2xl font-bold">
              {((review.score / review.totalQuestions) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Time Spent</p>
            <p className="text-2xl font-bold">
              {(review.timeSpent / 60).toFixed(1)}m
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Date</p>
            <p className="text-2xl font-bold">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {review.questions.map((q, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Question {index + 1}</CardTitle>
                <Badge
                  variant={q.isCorrect ? "default" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {q.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {q.isCorrect ? "Correct" : "Incorrect"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{q.question}</p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Your Answer:</p>
                <p className={q.isCorrect ? "text-green-600" : "text-red-600"}>
                  {q.userAnswer}
                </p>
                {!q.isCorrect && (
                  <>
                    <p className="text-sm font-medium">Correct Answer:</p>
                    <p className="text-green-600">{q.correctAnswer}</p>
                  </>
                )}
                {q.explanation && (
                  <>
                    <p className="text-sm font-medium">Explanation:</p>
                    <p className="text-muted-foreground">{q.explanation}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
