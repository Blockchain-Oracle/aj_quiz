"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SubjectPageSlug() {
  const { subject } = useParams();
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1999 },
    (_, i) => currentYear - i,
  );

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setShowConfirmation(true);
  };

  const handleStartQuiz = () => {
    router.push(`/dashboard/subject/${subject}/quiz?year=${selectedYear}`);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[180px]" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="space-y-3 p-4">
                  <Skeleton className="mx-auto h-6 w-16" />
                  <Skeleton className="mx-auto h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold capitalize">
            {subject} Past Questions
          </h1>
          <p className="text-muted-foreground">
            Select a year to practice past questions
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {years.map((year) => (
            <Card
              key={year}
              className="group overflow-hidden transition-colors hover:bg-muted/50"
            >
              <CardContent className="p-6">
                <Button
                  variant="ghost"
                  className="flex h-full w-full flex-col items-center gap-2"
                  onClick={() => handleYearSelect(year.toString())}
                >
                  <span className="text-xl font-semibold">{year}</span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Past Questions</span>
                  </div>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {showConfirmation && (
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Quiz</DialogTitle>
              <DialogDescription>
                Are you sure you want to start the quiz for {selectedYear}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="submit" onClick={handleStartQuiz}>
                Confirm
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
