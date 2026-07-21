import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "\u4f50\u6613-AI\u56fe\u50cf\u52a9\u7406",
  description:
    "\u6a21\u5757\u5316 AI \u51fa\u56fe\u5de5\u4f5c\u53f0\uff0c\u7528\u4ea7\u54c1\u56fe\u548c\u5546\u54c1\u53c2\u6570\u89e6\u53d1 Codex \u51fa\u56fe\u6d41\u7a0b\u3002",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
