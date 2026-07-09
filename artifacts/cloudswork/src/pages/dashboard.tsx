import { useGetDashboard, useGetWallet } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  TrendingUp, Wallet, Users, ArrowDownRight, ArrowUpRight,
  Sun, Bell, ChevronRight, Copy, CircleDollarSign,
  Briefcase, Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { InstallAppButton } from "@/components/install-app-button";
import { Card, CardContent } from "@/components/ui/card";

function StatCard({ label, value, icon: Icon, colorClass, delay }: {
  label: string; value: string; icon: any; colorClass: string; delay: string;
}) {
  return (
    <div className={cn("glass-card rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group", delay)}>
      <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner", colorClass)}>
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1 relative z-10">
        <p className="text-xs text-muted-foreground/80 tracking-wide uppercase font-medium">{label}</p>
        <p className="text-lg font-serif font-semibold text-foreground mt-1 truncate">{value}</p>
      </div>
    </div>
  );
}

function BalanceCard({ label, amount, icon: Icon, href, delay }: {
  label: string; amount: number; icon: any; href?: string; delay: string;
}) {
  const content = (
    <div className={cn("glass-card rounded-2xl p-4 relative overflow-hidden group hover:border-primary/30 transition-all duration-300", delay)}>
      <div className="absolute right-0 bottom-0 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center border border-white/5">
          <Icon className="w-4 h-4 text-primary" strokeWidth={2} />
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </div>
      <p className="text-[11px] text-muted-foreground/80 tracking-widest uppercase font-semibold">{label}</p>
      <p className="text-base font-serif font-medium text-foreground mt-1 tracking-tight">Rs. {amount.toLocaleString()}</p>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

function fmt(n: number) {
  return `Rs. ${n.toLocaleString()}`;
}

function txTypeColor(type: string) {
  switch (type) {
    case "deposit": return "text-blue-400";
    case "withdrawal": return "text-orange-400";
    case "profit": return "text-primary";
    case "commission": return "text-primary";
    case "purchase": return "text-white/60";
    default: return "text-muted-foreground";
  }
}

function txTypeBg(type: string) {
  switch (type) {
    case "deposit": return "bg-blue-500/10 border-blue-500/20";
    case "withdrawal": return "bg-orange-500/10 border-orange-500/20";
    case "profit": return "bg-primary/10 border-primary/20";
    case "commission": return "bg-primary/10 border-primary/20";
    case "purchase": return "bg-white/5 border-white/10";
    default: return "bg-secondary border-white/5";
  }
}

function txSign(type: string) {
  return ["deposit", "profit", "commission", "bonus", "refund"].includes(type) ? "+" : "-";
}

export default function DashboardPage() {
  const { data: dashboard, isLoading: dashboardLoading } = useGetDashboard();
  const { data: wallet, isLoading: walletLoading } = useGetWallet();
  const { toast } = useToast();
  const { user } = useAuth();

  const isLoading = dashboardLoading || walletLoading;
  const totalBalance = wallet ? wallet.depositBalance + wallet.withdrawBalance + wallet.profitBalance + wallet.commissionBalance : 0;

  const copyReferral = () => {
    if (dashboard?.referralLink) {
      navigator.clipboard.writeText(dashboard.referralLink);
      toast({ title: "Link Copied", description: "Your private invitation link has been copied." });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        {/* Welcome Section */}
        <div className="px-5 pt-8 pb-6 animate-stagger-1">
          <p className="text-muted-foreground/80 text-sm tracking-wide uppercase font-medium">Welcome Back</p>
          <h1 className="text-3xl font-serif font-semibold text-foreground mt-1">
            {isLoading ? <Skeleton className="h-8 w-40 bg-secondary" /> : user?.nickname || dashboard?.user?.nickname || "Member"}
          </h1>
        </div>

        {/* Main VIP Card */}
        <div className="px-5 mb-8 animate-stagger-1">
          <div className="relative rounded-[2rem] p-[1px] vip-gradient shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
            <div className="relative bg-background/95 backdrop-blur-2xl rounded-[2rem] p-6 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <p className="text-xs text-muted-foreground/80 tracking-widest uppercase font-semibold mb-2">Portfolio Value</p>
                {isLoading ? (
                  <Skeleton className="h-10 w-48 bg-secondary mt-1 mx-auto" />
                ) : (
                  <h2 className="text-4xl font-serif font-semibold vip-text-gradient tracking-tight drop-shadow-sm">
                    Rs. {totalBalance.toLocaleString()}
                  </h2>
                )}
                
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent my-6"></div>

                <div className="grid grid-cols-3 w-full gap-4">
                  <div className="flex flex-col items-center">
                    <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">Today</p>
                    <p className="text-sm font-semibold text-primary mt-1">{isLoading ? "..." : fmt(dashboard?.todayEarnings || 0)}</p>
                  </div>
                  <div className="flex flex-col items-center border-x border-border/50">
                    <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">Total Yield</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{isLoading ? "..." : fmt(dashboard?.totalEarnings || 0)}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">Active</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{isLoading ? "..." : (dashboard?.activeInvestments || 0)} <span className="text-muted-foreground text-xs font-normal">Plans</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 mb-8 animate-stagger-2">
          <div className="grid grid-cols-4 gap-3">
            {[
              { href: "/wallet?tab=deposit", icon: ArrowDownRight, label: "Deposit", color: "text-foreground" },
              { href: "/wallet?tab=withdraw", icon: ArrowUpRight, label: "Withdraw", color: "text-foreground" },
              { href: "/plans", icon: Briefcase, label: "Invest", color: "text-primary" },
              { href: "/referral", icon: Users, label: "Invite", color: "text-foreground" },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link key={href} href={href}>
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-full glass-card flex items-center justify-center group-hover:border-primary/40 group-active:scale-95 transition-all duration-300 shadow-lg">
                    <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", color)} strokeWidth={1.5} />
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-2 font-medium tracking-wide">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Portfolios / Wallets */}
        <div className="px-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-serif font-semibold tracking-wide text-foreground">Wealth Distribution</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl bg-secondary" />)
            ) : (
              <>
                <BalanceCard delay="animate-stagger-2" label="Deposit" amount={wallet?.depositBalance || 0} icon={Wallet} href="/wallet?tab=deposit" />
                <BalanceCard delay="animate-stagger-2" label="Profit" amount={wallet?.profitBalance || 0} icon={TrendingUp} href="/wallet?tab=history" />
                <BalanceCard delay="animate-stagger-3" label="Commission" amount={wallet?.commissionBalance || 0} icon={Activity} href="/referral" />
                <BalanceCard delay="animate-stagger-3" label="Withdrawable" amount={wallet?.withdrawBalance || 0} icon={CircleDollarSign} href="/wallet?tab=withdraw" />
              </>
            )}
          </div>
        </div>

        {/* Private Invite */}
        <div className="px-5 mb-8 animate-stagger-3">
          <div className="glass-card rounded-[1.5rem] p-5 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-serif font-semibold tracking-wide text-foreground">Private Invitation</h3>
                <p className="text-xs text-muted-foreground mt-1">Expand your wealth network</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <Users className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary/50 border border-white/5 rounded-xl px-4 py-3 font-mono text-xs text-muted-foreground truncate tracking-wider">
                {dashboard?.referralLink || "Loading..."}
              </div>
              <button 
                onClick={copyReferral} 
                className="bg-foreground text-background hover:bg-primary/90 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors active:scale-95"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="px-5 mb-8 animate-stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-serif font-semibold tracking-wide text-foreground">Recent Activity</h3>
            <Link href="/wallet?tab=history">
              <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary uppercase tracking-widest font-semibold transition-colors">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
          
          <div className="glass-card rounded-[1.5rem] p-2">
            <div className="divide-y divide-white/5">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="w-10 h-10 rounded-full bg-secondary" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-28 bg-secondary mb-1.5" />
                      <Skeleton className="h-3 w-20 bg-secondary" />
                    </div>
                    <Skeleton className="h-4 w-16 bg-secondary" />
                  </div>
                ))
              ) : dashboard?.recentTransactions?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm font-medium">
                  No recent activity
                </div>
              ) : (
                dashboard?.recentTransactions?.slice(0, 5).map(tx => {
                  const isPositive = txSign(tx.type) === "+";
                  const TxIcon = isPositive ? ArrowDownRight : ArrowUpRight;
                  return (
                    <div key={tx.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110", txTypeBg(tx.type))}>
                        <TxIcon className={cn("w-4 h-4", txTypeColor(tx.type))} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground capitalize tracking-tight">{tx.type}</p>
                        <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">{tx.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn("text-sm font-semibold block tracking-tight", isPositive ? "text-foreground" : "text-white/60")}>
                          {txSign(tx.type)}Rs. {tx.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                          {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
