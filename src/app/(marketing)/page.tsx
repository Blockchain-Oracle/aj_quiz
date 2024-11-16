import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, GraduationCap, Target } from "lucide-react";
import Link from "next/link";

export default function MarketingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Master Your Knowledge with{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AjQuiz
            </span>
          </h1>
          <p className="text-muted-foreground max-w-[42rem] leading-normal sm:text-xl sm:leading-8">
            Enhance your learning journey with our interactive quiz platform.
            Test your knowledge, track your progress, and learn from your
            mistakes.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container space-y-6 bg-slate-50 py-8 md:py-12 lg:py-24 dark:bg-transparent">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Features
          </h2>
          <p className="text-muted-foreground max-w-[85%] leading-normal sm:text-lg sm:leading-7">
            Everything you need to enhance your learning experience
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <div className="bg-background relative overflow-hidden rounded-lg border p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Brain className="h-12 w-12 text-purple-600" />
              <div className="space-y-2">
                <h3 className="font-bold">Adaptive Learning</h3>
                <p className="text-muted-foreground text-sm">
                  Questions adapt to your skill level for optimal learning
                </p>
              </div>
            </div>
          </div>
          <div className="bg-background relative overflow-hidden rounded-lg border p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Target className="h-12 w-12 text-purple-600" />
              <div className="space-y-2">
                <h3 className="font-bold">Progress Tracking</h3>
                <p className="text-muted-foreground text-sm">
                  Monitor your improvement with detailed analytics
                </p>
              </div>
            </div>
          </div>
          <div className="bg-background relative overflow-hidden rounded-lg border p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <GraduationCap className="h-12 w-12 text-purple-600" />
              <div className="space-y-2">
                <h3 className="font-bold">Multiple Subjects</h3>
                <p className="text-muted-foreground text-sm">
                  Wide range of topics to test your knowledge
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto max-w-[58rem] space-y-6 rounded-3xl bg-slate-900 px-8 py-12 text-center dark:bg-slate-800">
          <h2 className="font-heading text-3xl leading-[1.1] text-white sm:text-3xl md:text-6xl">
            Ready to Start?
          </h2>
          <p className="leading-normal text-slate-300 sm:text-lg sm:leading-7">
            Join thousands of students improving their knowledge every day.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100"
          >
            <Link href="/sign-up">
              Start Learning Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
