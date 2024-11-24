"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionData {
  id: number;
  question: string;
  option: Record<string, string>;
  answer: string;
  solution: string;
  examtype: string;
  examyear: string;
}

interface QuizState {
  answers: Record<number, string>;
  showExplanation: boolean;
  timeLeft: number;
}

const QUESTION_TIME = 60;

export default function QuizPageId() {
  const { subject, id } = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>({
    answers: {},
    showExplanation: false,
    timeLeft: QUESTION_TIME,
  });
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function fetchQuiz() {
      try {
        const response = await fetch(`/api/quiz/${subject}/${id}`);
        const data = await response.json();

        if (!data.data[`subject${id}`]?.data) {
          toast.error("Quiz not found");
          router.push("/dashboard/subject");
          return;
        }

        setQuestions(data.data[`subject${id}`].data);
        toast.success(
          `Loaded ${data.data[`subject${id}`].data.length} questions`,
        );
      } catch (error) {
        toast.error("Failed to load quiz");
        router.push("/dashboard/subject");
      } finally {
        setLoading(false);
      }
    }

    void fetchQuiz();
  }, [mounted, subject, id, router]);

  // Timer effect
  useEffect(() => {
    if (!showResult) {
      const timer = setInterval(() => {
        setQuizState((prev) => {
          if (prev.timeLeft <= 0) {
            clearInterval(timer);
            void handleNext();
            return prev;
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestion, showResult]);

  const handleAnswerSelect = (value: string) => {
    setQuizState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion]: value },
    }));
  };

  const handleNext = async () => {
    const currentAnswer = quizState.answers[currentQuestion];
    const correctAnswer = questions[currentQuestion]?.answer;

    if (currentAnswer === correctAnswer) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
      setQuizState((prev) => ({
        ...prev,
        timeLeft: QUESTION_TIME,
        showExplanation: false,
      }));
    } else {
      try {
        await fetch("/api/quiz/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: subject as string,
            quizId: id,
            score,
            totalQuestions: questions.length,
            timeSpent: QUESTION_TIME * questions.length - quizState.timeLeft,
            answers: quizState.answers,
          }),
        });
        setShowResult(true);
      } catch (error) {
        toast.error("Failed to save quiz results");
      }
    }
  };

  // Loading state
  if (!mounted || loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <Skeleton className="h-8 w-[200px]" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Result state

  if (showResult) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              Score: {score} / {questions.length}
            </div>
            <Progress
              value={(score / questions.length) * 100}
              className="mt-4"
            />
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push("/dashboard/subject")}>
              Back to Subjects
            </Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Question {currentQuestion + 1}</h1>
          <p className="text-sm text-muted-foreground">
            of {questions.length} questions
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {quizState.timeLeft}s
        </Badge>
      </div>

      <Progress value={(currentQuestion / questions.length) * 100} />

      <Card>
        <CardHeader>
          <CardTitle>{currentQ?.question}</CardTitle>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{currentQ?.examtype}</Badge>
            <Badge variant="outline">{currentQ?.examyear}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={quizState.answers[currentQuestion] ?? ""}
            onValueChange={handleAnswerSelect}
            className="space-y-4"
          >
            {Object.entries(currentQ?.option ?? {}).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={key} />
                <Label htmlFor={key}>{value}</Label>
              </div>
            ))}
          </RadioGroup>
          {quizState.showExplanation && currentQ?.solution && (
            <div className="mt-4 rounded-lg bg-muted p-4">
              <p className="text-sm">{currentQ?.solution}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              setQuizState((prev) => ({
                ...prev,
                showExplanation: !prev.showExplanation,
              }))
            }
          >
            {quizState.showExplanation ? "Hide" : "Show"} Explanation
          </Button>
          <Button
            onClick={handleNext}
            disabled={!quizState.answers[currentQuestion]}
          >
            {currentQuestion + 1 === questions.length ? "Finish" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
