import localFont from 'next/font/local';
import './globals.css';
import NavBar from './ui/navbar';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NotificationProvider } from './contexts/NotificationContext';
import Notification from './ui/notification';
import { Analytics } from '@vercel/analytics/react';
import { Tomorrow, Barlow } from 'next/font/google';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-barlow',
});
const tomorrow = Tomorrow({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-tomorrow',
});

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});
const jerseyFont = localFont({
  src: '/fonts/Jersey15-Regular.ttf', // Path to the font file in the `public` folder
  variable: '--font-jersey', // Optional: Define a CSS variable for the font
  weight: '400', // Specify weight if applicable
  style: 'normal', // Specify style if applicable
});

const icelandFont = localFont({
  src: '/fonts/Iceland-Regular.ttf',
  variable: '--font-iceland',
  weight: '400',
  style: 'normal',
});
const stalinistFont = localFont({
  src: '/fonts/StalinistOne-Regular.ttf',
  variable: '--font-stalinist',
});
const orbitronFont = localFont({
  src: 'fonts/Orbitron-VariableFont_wght.ttf',
  variable: '--font-orbitron',
  weight: '100 900',
});

export const metadata = {
  title: 'Vertix',
  description: '',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${tomorrow.variable} ${barlow.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jerseyFont.variable} ${icelandFont.variable} ${stalinistFont.variable} ${orbitronFont.variable} ${tomorrow.variable} ${barlow.variable}antialiased`}
      >
        <NotificationProvider>
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
