import localFont from "next/font/local";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NotificationProvider } from "./contexts/NotificationContext";
import { XpProvider } from "./contexts/XpContext";
import { AnnouncementProvider } from "./contexts/AnnouncementContext";
import Notification from "./ui/general/notification";
import Announcement from "./ui/general/announcement";
import { Tomorrow, Barlow, Jost } from "next/font/google";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { PostHogProvider } from "../components/PostHogProvider";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "./ui/general/footer";
import NavBar from "./ui/navbar/navbar";
import XpLevelBarWrapper from "./components/XpLevelBarWrapper";
import RouteChromeSync from "./components/RouteChromeSync";
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});
const tomorrow = Tomorrow({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-tomorrow",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-jost",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Vertix",
  description: "The OTR Climbing tracker for ropes, boulders, and competitions",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} ${tomorrow.variable} ${barlow.variable} ${jost.variable} antialiased bg-black min-h-screen flex flex-col`}
      >
        <ClerkProvider>
          <PostHogProvider>
            <NotificationProvider>
              <XpProvider initialXp={0}>
                <AnnouncementProvider>
                  <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
                  <RouteChromeSync />
                  <Notification />
                  <Announcement />
                  <NavBar />
                  <SpeedInsights />

                  <main className="flex-1">{children}</main>
                  <Footer />
                  <XpLevelBarWrapper />
                </AnnouncementProvider>
              </XpProvider>
            </NotificationProvider>
          </PostHogProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
