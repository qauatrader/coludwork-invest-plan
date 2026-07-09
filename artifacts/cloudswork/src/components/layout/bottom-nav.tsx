import { Link, useLocation } from "wouter";
import { Home, BarChart2, Wallet, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/plans", icon: BarChart2, label: "Plans" },
  { href: "/wallet", icon: Wallet, label: "Wallet" },
  { href: "/referral", icon: Users, label: "Network" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/40 safe-area-bottom">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link key={href} href={href}>
              <button className="relative flex flex-col items-center justify-center w-16 h-16 group outline-none">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300",
                  isActive ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(228,184,86,0.15)]" : "text-muted-foreground group-hover:text-primary/70"
                )}>
                  <Icon className={cn("h-5 w-5 transition-transform duration-300", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium mt-1 transition-all duration-300",
                  isActive ? "text-primary opacity-100" : "text-muted-foreground opacity-70 group-hover:opacity-100"
                )}>
                  {label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
