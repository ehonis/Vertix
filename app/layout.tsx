import localFont from "next/font/local";
import "./globals.css";
import NavBar from "./ui/navbar/navbar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NotificationProvider } from "./contexts/NotificationContext";
import Notification from "./ui/notification";
import { Tomorrow, Barlow } from "next/font/google";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { PostHogProvider } from "../components/PostHogProvider";
import Footer from "./ui/general/footer";

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

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Vertix",
  description: "The OTR Climbing tracker for ropes, boulders, and competitions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} ${tomorrow.variable} ${barlow.variable} antialiased bg-black min-h-screen flex flex-col`}
      >
        <PostHogProvider>
          <NotificationProvider>
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            <Notification />
            <NavBar />
            <SpeedInsights />

            <main className="flex-1">{children}</main>
            <Footer />
          </NotificationProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
