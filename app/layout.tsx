import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Aurora } from '@/components/glass/Aurora';
import { TopNav } from '@/components/TopNav';
import { VoiceDock } from '@/components/voice/VoiceDock';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Agentic RCM Demo · NTT DATA',
  description:
    'AI-led Revenue Cycle Management — 9-stage agentic operating model on Amazon Bedrock + Comprehend Medical, with an Azure Voice Live conversational agent.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans">
        <Aurora />
        <TopNav />
        <main className="relative mx-auto min-h-[calc(100vh-72px)] w-full max-w-[1440px] px-6 pb-32 pt-6 lg:px-10">
          {children}
        </main>
        <VoiceDock />
      </body>
    </html>
  );
}
