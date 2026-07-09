import type { Metadata } from 'next';
import './globals.css';
import ClientShell from '@/components/ClientShell';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'StudyMaterial — The Future of Learning for Developers',
  description: 'An immersive desktop-grade workspace engineered for developers to master modern frontend, backend, and AI stacks.',
  metadataBase: new URL('https://studymaterial.dev'),
  openGraph: {
    title: 'StudyMaterial — The Future of Learning for Developers',
    description: 'An immersive desktop-grade workspace engineered for developers to master modern frontend, backend, and AI stacks.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>" />
      </head>
      <body className="antialiased">
        <SessionProvider>
          <ClientShell>{children}</ClientShell>
        </SessionProvider>
      </body>
    </html>
  );
}
