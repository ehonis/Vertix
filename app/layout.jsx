import localFont from 'next/font/local';
import './globals.css';
import NavBar from './ui/navbar';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NotificationProvider } from './contexts/NotificationContext';
import Notification from './ui/notification';

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
const barlowFont = localFont({
  src: '/fonts/Barlow-Bold.ttf', // Path to the font file in the `public` folder
  variable: '--font-barlow', // Optional: Define a CSS variable for the font
  weight: '700', // Specify weight if applicable
  style: 'bold', // Specify style if applicable
});

export const metadata = {
  title: 'On The Rocks',
  description: '',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jerseyFont.variable} ${barlowFont.variable} antialiased`}
      >
        <NotificationProvider>
          <Notification />
          <NavBar />
          <SpeedInsights />
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
