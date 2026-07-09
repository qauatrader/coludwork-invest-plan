import { useGetDashboard, useGetWallet } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  TrendingUp, Wallet, Users, ArrowDownCircle, ArrowUpCircle,
  Sun, Bell, ChevronRight, Copy, PiggyBank, CircleDollarSign,
  Landmark, BadgePercent
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { InstallAppButton } from "@/components/install-app-button";
import { Card, CardContent } from "@/components/ui/card";

function StatCard({ label, value, icon: Icon, color, subtext }: {
  label: string; value: string; icon: any; color: string; subtext?: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-base font-bold text-foreground truncate">{value}</p>
          {subtext && <p className="text-[10px] text-muted-foreground truncate">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function BalanceCard({ label, amount, icon: Icon, color, href }: {
  label: string; amount: number; icon: any; color: string; href?: string
}) {
  const content = (
    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/50 hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold text-foreground">Rs. {amount.toLocaleString()}</p>
        </div>
      </div>
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
    case "commission": return "text-yellow-400";
    case "purchase": return "text-red-400";
    default: return "text-muted-foreground";
  }
}

function txTypeBg(type: string) {
  switch (type) {
    case "deposit": return "bg-blue-500/10";
    case "withdrawal": return "bg-orange-500/10";
    case "profit": return "bg-primary/10";
    case "commission": return "bg-yellow-500/10";
    case "purchase": return "bg-red-500/10";
    default: return "bg-secondary";
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
      toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between px-4 pt-6 pb-4">
          <div>
            <p className="text-muted-foreground text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-6 w-28" /> : user?.nickname || dashboard?.user?.nickname || "User"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notifications">
              <button className="w-9 h-9 bg-card border border-border rounded-xl flex items-center justify-center relative hover:border-primary/30 transition-colors">
                <Bell className="w-4 h-4" />
              </button>
            </Link>
            <div className="w-9 h-9 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center">
              <Sun className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>

        <div className="px-4">
          <InstallAppButton />
        </div>

        {/* Banner */}
        {dashboard?.banners && dashboard.banners.length > 0 && (
          <div className="px-4 mb-4">
            <div className="rounded-xl overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 h-28 flex items-center px-5">
              <div>
                <p className="text-xs text-primary font-medium uppercase tracking-wide">Solar Investment</p>
                <p className="text-base font-bold text-foreground mt-1">{dashboard.banners[0].title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Earn daily profits from solar energy</p>
              </div>
              <Sun className="ml-auto w-16 h-16 text-primary/20" />
            </div>
          </div>
        )}

        {/* Main Balance Card */}
        <div className="px-4 mb-4">
          <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 text-white overflow-hidden">
            <CardContent className="p-5 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <p className="text-sm text-white/80">Total Balance</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-40 bg-white/20 mt-1" />
                ) : (
                  <p className="text-3xl font-bold mt-1">Rs. {totalBalance.toLocaleString()}</p>
                )}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-white/70">Today&apos;s Profit</p>
                    <p className="text-sm font-semibold">{isLoading ? "..." : fmt(dashboard?.todayEarnings || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Total Earned</p>
                    <p className="text-sm font-semibold">{isLoading ? "..." : fmt(dashboard?.totalEarnings || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Active Plans</p>
                    <p className="text-sm font-semibold">{isLoading ? "..." : (dashboard?.activeInvestments || 0)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Balance Breakdown */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[68px] rounded-xl" />)
            ) : (
              <>
                <BalanceCard label="Deposit" amount={wallet?.depositBalance || 0} icon={PiggyBank} color="bg-blue-500/10 text-blue-400" href="/wallet?tab=deposit" />
                <BalanceCard label="Profit" amount={wallet?.profitBalance || 0} icon={TrendingUp} color="bg-primary/10 text-primary" href="/wallet?tab=history" />
                <BalanceCard label="Commission" amount={wallet?.commissionBalance || 0} icon={BadgePercent} color="bg-yellow-500/10 text-yellow-400" href="/referral" />
                <BalanceCard label="Withdrawable" amount={wallet?.withdrawBalance || 0} icon={Wallet} color="bg-orange-500/10 text-orange-400" href="/wallet?tab=withdraw" />
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-4 mb-4 grid grid-cols-2 gap-3">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          ) : (
            <>
              <StatCard label="Total Deposit" value={fmt(dashboard?.totalDeposit || 0)} icon={ArrowDownCircle} color="bg-blue-500/10 text-blue-400" />
              <StatCard label="Total Withdraw" value={fmt(dashboard?.totalWithdraw || 0)} icon={ArrowUpCircle} color="bg-orange-500/10 text-orange-400" />
              <StatCard label="Total Referrals" value={String(dashboard?.totalReferrals || 0)} icon={Users} color="bg-yellow-500/10 text-yellow-400" subtext={`${dashboard?.activeInvestments || 0} active plans`} />
              <StatCard label="Active Plans" value={String(dashboard?.activeInvestments || 0)} icon={TrendingUp} color="bg-primary/10 text-primary" />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { href: "/wallet?tab=deposit", icon: ArrowDownCircle, label: "Deposit", color: "text-blue-400" },
              { href: "/wallet?tab=withdraw", icon: ArrowUpCircle, label: "Withdraw", color: "text-orange-400" },
              { href: "/plans", icon: TrendingUp, label: "Invest", color: "text-primary" },
              { href: "/referral", icon: Users, label: "Refer", color: "text-yellow-400" },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link key={href} href={href}>
                <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1.5 hover:border-primary/30 transition-colors active:scale-95">
                  <Icon className={cn("w-5 h-5", color)} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Referral Link */}
        <div className="px-4 mb-4">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">Your Referral Link</p>
                <button onClick={copyReferral} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <p className="text-xs text-muted-foreground truncate bg-secondary/50 rounded-lg px-3 py-2 font-mono">
                {dashboard?.referralLink || "Loading..."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Recent Transactions</h2>
            <Link href="/wallet?tab=history">
              <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                See all <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="w-9 h-9 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : dashboard?.recentTransactions?.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No transactions yet
                </div>
              ) : (
                dashboard?.recentTransactions?.slice(0, 5).map(tx => {
                  const isPositive = txSign(tx.type) === "+";
                  const TxIcon = isPositive ? ArrowDownCircle : ArrowUpCircle;
                  return (
                    <div key={tx.id} className="flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", txTypeBg(tx.type))}>
                        <TxIcon className={cn("w-4 h-4", txTypeColor(tx.type))} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                        <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                      </div>
                      <span className={cn("text-sm font-semibold shrink-0", isPositive ? "text-primary" : "text-red-400")}>
                        {txSign(tx.type)}Rs.{tx.amount.toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
