import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { NavbarWrapper } from "@/components/navbar-wrapper";
import { Footer } from "@/components/footer";
import { ModelRequestBubble } from "@/components/model-request-bubble";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "@/lib/init-scheduler"; // Initialize the prompt scheduler

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI SEO - Rank Higher - Get Recommended by AI | Juicy Links",
  description: "AI will replace traditional search engines. Get your business recommended by Grok, GPT-5, Claude 4, Gemini 2.5, and Perplexity. The fastest growing industry ever - AI SEO platform.",
  keywords: "AI SEO, rank higher, get recommended by AI, Grok, GPT-5, Claude 4, Gemini 2.5, Perplexity, AI search engines, fastest growing industry, LLM optimization",
  authors: [{ name: "Juicy Links" }],
  creator: "Juicy Links",
  publisher: "Juicy Links",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://juicylinks.com",
    siteName: "Juicy Links",
    title: "Juicy Links - AI-Powered SEO for the Future",
    description: "Train AI models to recommend your business. Get ahead in the AI revolution with our LLM SEO platform.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Juicy Links - AI-Powered SEO",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Juicy Links - AI-Powered SEO for the Future",
    description: "Train AI models to recommend your business. Get ahead in the AI revolution.",
    images: ["/og-image.png"],
    creator: "@juicylinks",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="relative flex min-h-screen flex-col">
                <NavbarWrapper />
                <main className="flex-1">{children}</main>
                <Footer />
                <ModelRequestBubble />
              </div>
            </ThemeProvider>
          </StackTheme>
        </StackProvider>
        <Analytics />
      </body>
    </html>
  );
}
