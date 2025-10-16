import "./styles.css";
import type { ReactNode } from "react";
import Logout from "@/components/Logout";
import AppSidebar from "@/components/AppSidebar";
import RetroNavBarWrapper from "@/components/RetroNavBarWrapper";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <RetroNavBarWrapper />
        <div className="shell">
          <AppSidebar />
          <main className="main">
            <div className="main-content">
              {children}
            </div>
          </main>
        </div>
        <div className="topbar">
          <div className="grow" />
          <Logout />
        </div>
      </body>
    </html>
  );
}
