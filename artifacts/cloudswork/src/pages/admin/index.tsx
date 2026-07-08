import { useGetAdminStats } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, ArrowDownCircle, ArrowUpCircle, TrendingUp, Activity } from "lucide-react";

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: any; color: string; sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Overview</h2>
          <p className="text-sm text-muted-foreground">Platform statistics at a glance</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats?.totalUsers || 0} icon={Users} color="bg-blue-500/10 text-blue-400" sub={`${stats?.onlineUsers || 0} online`} />
          <StatCard label="Today Deposit" value={`Rs.${(stats?.todayDeposit || 0).toLocaleString()}`} icon={ArrowDownCircle} color="bg-primary/10 text-primary" sub={`${stats?.pendingDeposits || 0} pending`} />
          <StatCard label="Today Withdrawal" value={`Rs.${(stats?.todayWithdrawal || 0).toLocaleString()}`} icon={ArrowUpCircle} color="bg-orange-500/10 text-orange-400" sub={`${stats?.pendingWithdrawals || 0} pending`} />
          <StatCard label="Online Users" value={stats?.onlineUsers || 0} icon={TrendingUp} color="bg-yellow-500/10 text-yellow-400" />
          <StatCard label="Pending Deposits" value={stats?.pendingDeposits || 0} icon={DollarSign} color="bg-green-500/10 text-green-400" />
          <StatCard label="Pending Withdrawals" value={stats?.pendingWithdrawals || 0} icon={DollarSign} color="bg-red-500/10 text-red-400" />
          <StatCard label="Total Profit Paid" value={`Rs.${(stats?.totalProfit || 0).toLocaleString()}`} icon={Activity} color="bg-purple-500/10 text-purple-400" />
          <StatCard label="Total Revenue" value={`Rs.${(stats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="bg-cyan-500/10 text-cyan-400" />
        </div>

        {/* Quick access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">Pending Actions</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Pending Deposits", value: stats?.pendingDeposits || 0, href: "/admin/deposits", color: "text-yellow-400" },
                { label: "Pending Withdrawals", value: stats?.pendingWithdrawals || 0, href: "/admin/withdrawals", color: "text-orange-400" },
              ].map(({ label, value, href, color }) => (
                <a key={href} href={href} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                  <span className="text-sm text-foreground">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-medium text-foreground mb-3">Platform Health</h3>
            <div className="space-y-2">
              {[
                { label: "Online Users", value: `${stats?.onlineUsers || 0} / ${stats?.totalUsers || 0}`, pct: ((stats?.onlineUsers || 0) / Math.max(stats?.totalUsers || 1, 1)) * 100 },
              ].map(({ label, value, pct }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground">{value}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
