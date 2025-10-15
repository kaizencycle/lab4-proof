import "./styles.css";
import type { ReactNode } from "react";
import Logout from "@/components/Logout";
import AppSidebar from "@/components/AppSidebar";
import RetroNavBarWrapper from "@/components/RetroNavBarWrapper";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RetroNavBarWrapper />
        <div className="shell">
          <AppSidebar />
          <main className="main">{children}</main>
        </div>
        <div className="topbar">
          <div className="grow" />
          <Logout />
        </div>
      </body>
    </html>
  );
}
