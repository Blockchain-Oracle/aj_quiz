import "@/styles/globals.css";

import { type Metadata } from "next";
import MarketingNavBarWrapper from "./_componets/MarketNavWrap";

export const metadata: Metadata = {
  title: "Marketing Page",
  description: "This is the marketing page of the T3 App",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavBarWrapper />
      <main className="flex-1">{children}</main>
    </div>
  );
}
