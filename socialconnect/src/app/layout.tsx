import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SocialConnect | Connect with Creators & Friends",
  description: "A premium, minimalist social space designed for meaningful connections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white overflow-x-hidden`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="mx-auto flex w-full max-w-[1600px] flex-1 items-start px-2 sm:px-4 lg:px-6">
              <Sidebar />
              <main className="flex-1 min-w-0 p-2 sm:p-4 md:p-6 pb-20 md:pb-6 min-h-[calc(100vh-4rem)]">
                {children}
              </main>
              <RightPanel />
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
