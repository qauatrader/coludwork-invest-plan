import { Link, useLocation } from "wouter";
import { Home, BarChart2, Wallet, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/plans", icon: BarChart2, label: "Plans" },
  { href: "/wallet", icon: Wallet, label: "Wallet" },
  { href: "/referral", icon: Users, label: "Team" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link key={href} href={href}>
              <button className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}>
                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_rgba(5,150,105,0.8)]")} />
                <span className="text-[10px] font-medium">{label}</span>
                {isActive && (
                  <span className="absolute -bottom-0 w-6 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
