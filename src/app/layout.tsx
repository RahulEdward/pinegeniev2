import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import ThemeScript from '@/agents/pinegenie-agent/components/ThemeScript';
import ThemeInitializer from '@/components/ThemeInitializer';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <ThemeInitializer />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}