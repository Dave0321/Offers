import "./globals.css";
import { Metadata } from "next";
import { V0Provider } from "@/lib/v0-context";
import { AuthProvider } from "@/lib/auth-context";
import { RoleProvider } from "@/lib/role-context";
import { IssueProvider } from "@/lib/issue-context";
import localFont from "next/font/local";
import LayoutShell from "@/components/layout-shell";

const rebelGrotesk = localFont({
  src: "../public/fonts/Rebels-Fett.woff2",
  variable: "--font-rebels",
  display: "swap",
});

const isV0 = process.env["VERCEL_URL"]?.includes("vusercontent.net") ?? false;

export const metadata: Metadata = {
  title: {
    template: "%s – ReportJe",
    default: "ReportJe — Report & resolve community issues",
  },
  description:
    "ReportJe centralises community and public issue reporting across Malaysia — one system connecting residents with the right local agency.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <link
          rel="preload"
          href="/fonts/Rebels-Fett.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${rebelGrotesk.variable} antialiased`}
      >
        <V0Provider isV0={isV0}>
          <AuthProvider>
            <RoleProvider>
              <IssueProvider>
                <LayoutShell>{children}</LayoutShell>
              </IssueProvider>
            </RoleProvider>
          </AuthProvider>
        </V0Provider>
      </body>
    </html>
  );
}
