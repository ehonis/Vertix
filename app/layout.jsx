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

export const metadata = {
  title: 'On The Rocks',
  description: '',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
