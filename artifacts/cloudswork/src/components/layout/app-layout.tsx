import { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { useTheme } from "@/lib/theme";
import { Bell } from "lucide-react";
import { Link } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Top header bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-lg mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full vip-gradient flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center font-serif font-bold text-primary text-sm">
                CW
              </div>
            </div>
            <span className="font-serif font-semibold text-base vip-text-gradient tracking-wide">CloudsWork</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/notifications">
              <button className="relative w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-300">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className={hideNav ? "" : "pb-24"}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
