import type { Metadata } from 'next';
import { Geist, Geist_Mono, Fraunces } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Modern, slightly architectural serif. Used only for listing titles & hero
// headlines — the editorial voice of the product. See .interface-design/system.md.
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const title = 'PropAlign — South African Property Concierge';
const description =
  'Find the right home in South Africa. PropAlign uses your life-stage, budget, and what actually matters to you to surface listings worth your time.';
const ogImage = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: title,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://propalign.co.za'),
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://propalign.co.za',
    siteName: 'PropAlign',
    images: [ogImage],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
