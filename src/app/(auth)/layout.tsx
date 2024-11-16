"use client";
import "@/styles/globals.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AuthHero from "./_components/AuthHero";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* Left side - Hero Section */}
      <AuthHero />

      {/* Right side - Auth Form */}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
