"use client";

import * as React from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const { userId } = useAuth();
  const router = useRouter();
  if (userId) {
    router.push("/dashboard");
  }
  const { isLoaded, signIn, setActive } = useSignIn();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormData) {
    if (!isLoaded) return;

    try {
      setIsLoading(true);

      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("You have been logged in.");
        router.push("/dashboard");
      } else {
        toast.error("Invalid email or password.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loginWithSocial(provider: "oauth_google" | "oauth_github") {
    if (!isLoaded) return;

    try {
      setIsLoading(true);
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (error) {
      toast.error("Something went wrong with social login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center">
          Choose your preferred sign in method
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-6">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => loginWithSocial("oauth_google")}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => loginWithSocial("oauth_github")}
          >
            <Icons.gitHub className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign in
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          <Link
            href="/forgot-password"
            className="text-primary underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
