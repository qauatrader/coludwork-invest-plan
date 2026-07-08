import { useGetDashboard } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  TrendingUp, Wallet, Users, ArrowDownCircle,
  ArrowUpCircle, Sun, Bell, ChevronRight, Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { InstallAppButton } from "@/components/install-app-button";

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: any; color: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-base font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
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

function txSign(type: string) {
  return ["deposit", "profit", "commission", "bonus", "refund"].includes(type) ? "+" : "-";
}

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboard();
  const { toast } = useToast();
  const { user } = useAuth();

  const copyReferral = () => {
    if (data?.referralLink) {
      navigator.clipboard.writeText(data.referralLink);
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
              {isLoading ? <Skeleton className="h-6 w-28" /> : data?.user?.nickname || user?.nickname}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notifications">
              <button className="w-9 h-9 bg-card border border-border rounded-xl flex items-center justify-center relative">
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
        {data?.banners && data.banners.length > 0 && (
          <div className="px-4 mb-4">
            <div className="rounded-xl overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 h-28 flex items-center px-5">
              <div>
                <p className="text-xs text-primary font-medium uppercase tracking-wide">Solar Investment</p>
                <p className="text-base font-bold text-foreground mt-1">{data.banners[0].title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Earn daily profits from solar energy</p>
              </div>
              <Sun className="ml-auto w-16 h-16 text-primary/20" />
            </div>
          </div>
        )}

        {/* Balance Card */}
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-br from-primary to-primary/70 rounded-2xl p-5 text-white">
            <p className="text-sm text-white/80">Total Balance</p>
            {isLoading ? (
              <Skeleton className="h-8 w-40 bg-white/20 mt-1" />
            ) : (
              <p className="text-3xl font-bold mt-1">
                Rs. {((data?.totalEarnings || 0) + (data?.totalDeposit || 0)).toLocaleString()}
              </p>
            )}
            <div className="flex gap-4 mt-4">
              <div>
                <p className="text-xs text-white/70">Today's Profit</p>
                <p className="text-sm font-semibold">
                  {isLoading ? "..." : fmt(data?.todayEarnings || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/70">Total Earned</p>
                <p className="text-sm font-semibold">
                  {isLoading ? "..." : fmt(data?.totalEarnings || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/70">Active Plans</p>
                <p className="text-sm font-semibold">{data?.activeInvestments || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-4 mb-4 grid grid-cols-2 gap-3">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          ) : (
            <>
              <StatCard label="Total Deposit" value={fmt(data?.totalDeposit || 0)} icon={ArrowDownCircle} color="bg-blue-500/10 text-blue-400" />
              <StatCard label="Total Withdraw" value={fmt(data?.totalWithdraw || 0)} icon={ArrowUpCircle} color="bg-orange-500/10 text-orange-400" />
              <StatCard label="Total Referrals" value={String(data?.totalReferrals || 0)} icon={Users} color="bg-yellow-500/10 text-yellow-400" />
              <StatCard label="Active Plans" value={String(data?.activeInvestments || 0)} icon={TrendingUp} color="bg-primary/10 text-primary" />
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
                <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1.5 hover:border-primary/30 transition-colors">
                  <Icon className={cn("w-5 h-5", color)} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Referral Link */}
        <div className="px-4 mb-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">Your Referral Link</p>
              <button onClick={copyReferral} className="flex items-center gap-1 text-xs text-primary">
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <p className="text-xs text-muted-foreground truncate bg-secondary/50 rounded-lg px-3 py-2">
              {data?.referralLink || "Loading..."}
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Recent Transactions</h2>
            <Link href="/wallet?tab=history">
              <button className="flex items-center gap-1 text-xs text-primary">
                See all <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
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
            ) : data?.recentTransactions?.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No transactions yet
              </div>
            ) : (
              data?.recentTransactions?.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center gap-3 p-3">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center bg-secondary", txTypeColor(tx.type))}>
                    {["deposit", "profit", "commission", "bonus"].includes(tx.type)
                      ? <ArrowDownCircle className="w-4 h-4" />
                      : <ArrowUpCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                  </div>
                  <span className={cn("text-sm font-semibold", txSign(tx.type) === "+" ? "text-primary" : "text-red-400")}>
                    {txSign(tx.type)}Rs.{tx.amount.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
