// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css'; // Your CSS imports

export const metadata: Metadata = {
  title: 'African Remote Job - Remote Jobs for African Talent',
  description:
    'Connect with top global companies hiring African remote talent. Video interviews, chat, and secure payments.',
  keywords: [
    'remote jobs africa',
    'work from home',
    'remote tech jobs',
    'freelancer africa',
  ],

  // 1. Google Verification Code HERE
  verification: {
    google: 'LF2pY_30gmjwRD1z7KGkXS3yUdPOcIG0l27r0fSTApU',
  },

  // 2. OpenGraph Meta Tags for Social Previews (WhatsApp, LinkedIn, Twitter)
  openGraph: {
    title: 'African Remote Job - Work From Home',
    description:
      'Connect with top global companies hiring African remote talent.',
    url: 'https://www.africanremotejob.com',
    siteName: 'African Remote Job',
    images: [
      {
        url: 'https://www.africanremotejob.com/og-image.jpg', // Make sure this image exists in your public folder
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}