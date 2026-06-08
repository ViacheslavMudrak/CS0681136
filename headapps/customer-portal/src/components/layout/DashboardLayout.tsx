"use client";

import React, { useEffect, useState } from "react";

import { tailwindClasses } from "@/lib/tailwind-utils";

import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1025);
      // On mobile, sidebar starts collapsed (hidden)
      if (window.innerWidth < 1025) {
        setIsSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Calculate margin-inline-start based on sidebar state and screen size
  const mainContentMargin = isMobile ? 0 : isSidebarCollapsed ? 56 : 233;

  return (
    <div className="min-h-screen bg-portal-bg flex">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebar} />
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginInlineStart: `${mainContentMargin}px` }}
      >
        <Header onToggleSidebar={handleToggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        <main className={tailwindClasses.layout.contentArea}>{children}</main>
      </div>
      {/* Mobile overlay */}
      {!isSidebarCollapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={handleToggleSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
