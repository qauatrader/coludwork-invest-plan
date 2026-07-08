import { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { useTheme } from "@/lib/theme";
import { Sun, Moon, Bell } from "lucide-react";
import { Link } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Top header bar */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center overflow-hidden">
              <img src="/vip-logo.png" alt="CloudsWork VIP" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-sm text-primary tracking-wide">CloudsWork</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notifications">
              <button className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-4 h-4" />
              </button>
            </Link>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className={hideNav ? "" : "pb-20"}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
