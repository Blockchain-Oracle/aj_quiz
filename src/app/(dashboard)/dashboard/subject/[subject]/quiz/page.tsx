/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

export const forceHydration = false;
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  AlocQuizService,
  type QuestionResponse,
} from "@/services/AlocQuizService";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizState {
  answers: Record<number, string>;
  showExplanation: boolean;
  timeLeft: number;
}

const QUESTION_TIME = 60;

export default function QuizPage() {
  const { subject } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>({
    answers: {},
    showExplanation: false,
    timeLeft: QUESTION_TIME,
  });
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function fetchQuestions() {
      try {
        const response = (await AlocQuizService.getQuestionByYearsAndSubject(
          subject as string,
          searchParams.get("year")!,
        )) as {
          data: QuestionResponse[];
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!response || response.data.length === 0) {
          toast.error("No questions available", {
            description: "Please try a different subject",
          });
          router.push("/dashboard/subject");
          return;
        }
        console.log(response);

        setQuestions(response.data);
        toast.success(`Loaded ${response.data.length} questions`);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load questions", {
          description: "Please try again later",
        });
        router.push("/dashboard/subject");
      } finally {
        setLoading(false);
      }
    }

    void fetchQuestions();
  }, [mounted, subject, router, searchParams]);

  const handleNext = useCallback(async () => {
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
        await fetch("/api/quiz/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: subject as string,
            score,
            totalQuestions: questions.length,
            timeSpent: QUESTION_TIME * questions.length - quizState.timeLeft,
            answers: quizState.answers,
          }),
        });

        setShowResult(true);
        toast.success("Quiz completed!");
      } catch (error) {
        console.error("Failed to save quiz results:", error);
        toast.error("Failed to save quiz results");
      }
    }
  }, [
    quizState.answers,
    quizState.timeLeft,
    currentQuestion,
    questions,
    subject,
    score,
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!showResult) {
      timer = setInterval(() => {
        setQuizState((prev) => {
          if (prev.timeLeft <= 0) {
            clearInterval(timer);
            void handleNext();
            return prev;
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentQuestion, handleNext, showResult]);

  if (!mounted || loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-full" />
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

  const handleAnswerSelect = (value: string) => {
    setQuizState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion]: value },
    }));
  };

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
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={quizState.answers[currentQuestion] ?? ""}
            onValueChange={handleAnswerSelect}
            className="space-y-4"
          >
            {currentQ?.option &&
              Object.entries(currentQ.option).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key}>{value}</Label>
                </div>
              ))}
          </RadioGroup>
          {quizState.showExplanation && currentQ?.solution && (
            <div className="mt-4 rounded-lg bg-muted p-4">
              <p className="text-sm">{currentQ.solution}</p>
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
