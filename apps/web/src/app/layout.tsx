import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Milkman — Fresh Milk Delivery in Kutus, Kirinyaga',
  description: 'Fresh milk delivered to your doorstep in Kutus, Kirinyaga. Order between 8:00 AM and 10:00 PM for next-morning delivery. KSh 50 per pack.',
  keywords: ['milk delivery', 'Kutus', 'Kirinyaga', 'fresh milk', 'Kenya', 'M-Pesa', 'The Milkman'],
  authors: [{ name: 'The Milkman' }],
  openGraph: {
    title: 'The Milkman — Fresh Milk Delivery',
    description: 'Fresh milk delivered to your doorstep in Kutus, Kirinyaga. Order between 8:00 AM and 10:00 PM for next-morning delivery.',
    url: 'https://milkman-xi.vercel.app',
    siteName: 'The Milkman',
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Milkman — Fresh Milk Delivery',
    description: 'Fresh milk delivered to your doorstep in Kutus, Kirinyaga.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <head>
        <link rel="stylesheet" href="/fonts/playfair-local.css" />
        <link rel="stylesheet" href="/fonts/cormorant-local.css" />
      </head>
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}
