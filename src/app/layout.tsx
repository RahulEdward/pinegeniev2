import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Providers } from '@/components/providers';
import ThemeScript from '@/agents/pinegenie-agent/components/ThemeScript';
import ThemeInitializer from '@/components/ThemeInitializer';

export const metadata: Metadata = {
  title: 'Pine Genie',
  description: 'AI-Powered Visual Builder for TradingView Strategies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeInitializer />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}