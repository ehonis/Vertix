import localFont from "next/font/local";
import "./globals.css";
import NavBar from "./ui/navbar/navbar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NotificationProvider } from "./contexts/NotificationContext";
import Notification from "./ui/notification";
import { Analytics } from "@vercel/analytics/react";
import { Tomorrow, Barlow } from "next/font/google";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-barlow",
});
const tomorrow = Tomorrow({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-tomorrow",
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
    <html lang="en" className={`${tomorrow.variable} ${barlow.variable}`}>
      <body
        className={` ${geistMono.variable} ${tomorrow.variable} ${barlow.variable}antialiased bg-black`}
      >
        <NotificationProvider>
          <NextSSRPlugin
            /**
             * The `extractRouterConfig` will extract **only** the route configs
             * from the router to prevent additional information from being
             * leaked to the client. The data passed to the client is the same
             * as if you were to fetch `/api/uploadthing` directly.
             */
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <Notification />
          <NavBar />
          <SpeedInsights />
          <Analytics />

          <main className="">{children}</main>
        </NotificationProvider>
      </body>
    </html>
  );
}
