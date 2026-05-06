import React, { useState } from "react";
import { Menu, X, LogOut, Home, FileText, MessageSquare, Download } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface CyberpunkDashboardProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function CyberpunkDashboard({
  children,
  currentPage,
  onNavigate,
}: CyberpunkDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glow-box p-12 text-center max-w-md">
          <h1 className="text-4xl font-bold neon-glow mb-4">AI RESUME ANALYZER</h1>
          <p className="text-foreground mb-8 text-lg">
            Optimize your resume with AI-powered analysis and real-time feedback
          </p>
          <a
            href={getLoginUrl()}
            className="btn-neon inline-block px-8 py-3"
          >
            Login to Start
          </a>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "upload", label: "Upload Resume", icon: FileText },
    { id: "chatbot", label: "AI Assistant", icon: MessageSquare },
    { id: "history", label: "Resume History", icon: Download },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-card border-r-2 border-primary transition-all duration-300 flex flex-col glow-box-cyan`}
      >
        {/* Logo */}
        <div className="p-6 border-b-2 border-primary">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h2 className="text-xl font-bold neon-glow truncate">AI RESUME</h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-secondary hover:text-accent transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all ${
                  currentPage === item.id
                    ? "bg-primary text-primary-foreground neon-glow"
                    : "text-foreground hover:bg-muted hover:text-accent"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t-2 border-primary">
          {sidebarOpen && (
            <div className="mb-4 text-sm">
              <p className="text-muted-foreground">Logged in as</p>
              <p className="text-accent font-semibold truncate">{user?.name || user?.email}</p>
            </div>
          )}
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-sm bg-destructive text-destructive-foreground hover:bg-red-600 transition-colors text-sm font-semibold"
          >
            <LogOut size={16} />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
