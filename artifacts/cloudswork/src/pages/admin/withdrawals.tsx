import { useState } from "react";
import { useGetAdminWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAdminWithdrawalsQueryKey } from "@workspace/api-client-react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    approved: "bg-primary/10 text-primary border-primary/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return <Badge className={`${map[status] || ""} capitalize text-xs`}>{status}</Badge>;
}

export default function AdminWithdrawals() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const { data: withdrawals, isLoading } = useGetAdminWithdrawals({ status: statusFilter as any });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approve = useApproveWithdrawal({
    mutation: {
      onSuccess: () => {
        toast({ title: "Withdrawal approved!" });
        queryClient.invalidateQueries({ queryKey: getGetAdminWithdrawalsQueryKey() });
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  const reject = useRejectWithdrawal({
    mutation: {
      onSuccess: () => {
        toast({ title: "Withdrawal rejected" });
        queryClient.invalidateQueries({ queryKey: getGetAdminWithdrawalsQueryKey() });
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">User</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Amount</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Method</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Account</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Date</th>
                  <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array(7).fill(0).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : withdrawals?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No {statusFilter} withdrawals
                    </td>
                  </tr>
                ) : withdrawals?.map((w: any) => (
                  <tr key={w.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{w.user?.nickname || `User #${w.userId}`}</p>
                      <p className="text-xs text-muted-foreground">{w.user?.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-foreground">Rs.{w.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Net: Rs.{w.netAmount?.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{w.walletType}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-foreground">{w.accountTitle}</p>
                      <p className="text-xs text-muted-foreground font-mono">{w.iban}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(w.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {w.status === "pending" && (
                        <div className="flex items-center gap-1 justify-end">
                          <Button size="sm" className="bg-primary hover:bg-primary/90 h-7 px-2" onClick={() => approve.mutate({ id: w.id, data: {} })}>
                            <CheckCircle className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-400 border-red-400/30 h-7 px-2" onClick={() => reject.mutate({ id: w.id, data: {} })}>
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
