import { useState } from "react";
import { useGetAdminUsers, useSuspendUser, useDeleteAdminUser } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAdminUsersQueryKey } from "@workspace/api-client-react";
import { Search, ShieldOff, Trash2, Shield } from "lucide-react";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetAdminUsers({ search: search || undefined });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const suspend = useSuspendUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "User updated" });
        queryClient.invalidateQueries({ queryKey: getGetAdminUsersQueryKey() });
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  const deleteUser = useDeleteAdminUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "User deleted" });
        queryClient.invalidateQueries({ queryKey: getGetAdminUsersQueryKey() });
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">User</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Balance</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Joined</th>
                  <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array(5).fill(0).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : data?.users?.map(user => (
                  <tr key={user.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                          {user.nickname[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.nickname}</p>
                          <p className="text-xs text-muted-foreground">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">Rs.{(user.depositBalance || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">deposit</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {user.isAdmin && <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs w-fit">Admin</Badge>}
                        {(user as any).isSuspended
                          ? <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs w-fit">Suspended</Badge>
                          : <Badge className="bg-primary/10 text-primary border-primary/20 text-xs w-fit">Active</Badge>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={(user as any).isSuspended ? "text-primary" : "text-yellow-400"}
                          onClick={() => suspend.mutate({ id: user.id, data: { suspended: !(user as any).isSuspended } })}
                          disabled={user.isAdmin}
                        >
                          {(user as any).isSuspended ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400"
                          onClick={() => {
                            if (confirm("Delete this user?")) deleteUser.mutate({ id: user.id });
                          }}
                          disabled={user.isAdmin}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isLoading && (
            <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
              {data?.total || 0} users total
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
