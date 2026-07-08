import { useGetNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { getGetNotificationsQueryKey } from "@workspace/api-client-react";
import { Bell, CheckCheck, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const notifIcons: Record<string, string> = {
  deposit_approved: "💰",
  withdrawal_approved: "💸",
  plan_purchased: "📈",
  profit_added: "✨",
  referral_earned: "👥",
  system: "🔔",
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useGetNotifications();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const markRead = useMarkNotificationRead({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() }),
    },
  });

  const markAll = useMarkAllNotificationsRead({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() }),
    },
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setLocation(-1 as any)} className="w-9 h-9 bg-card border border-border rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              <CheckCheck className="w-4 h-4 mr-1.5" /> Mark all read
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : notifications?.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications?.map(n => (
              <div
                key={n.id}
                className={cn(
                  "bg-card border rounded-xl p-4 flex gap-3 cursor-pointer transition-all",
                  !n.isRead ? "border-primary/30 bg-primary/5" : "border-border"
                )}
                onClick={() => !n.isRead && markRead.mutate({ id: n.id })}
              >
                <div className="text-xl shrink-0 mt-0.5">{notifIcons[n.type] || "🔔"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-semibold", !n.isRead ? "text-foreground" : "text-muted-foreground")}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
