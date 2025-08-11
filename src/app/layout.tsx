import type { Metadata } from "next";
import "./globals.css";
import { Providers } from './providers';

export const metadata: Metadata = {
  title: "Daily Spark ⚡",
  description: "A minimal Question of the Day app where you answer thoughtful questions and discover insights from the community.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Daily Spark ⚡",
    description: "One question. Your voice. Our community.",
    images: ["/icon.svg"],
  },
  twitter: {
    card: "summary",
    title: "Daily Spark ⚡",
    description: "One question. Your voice. Our community.",
    images: ["/icon.svg"],
  },
  manifest: "/.well-known/farcaster.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
