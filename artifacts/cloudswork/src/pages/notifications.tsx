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
    <AppLayout hideNav>
      <div className="max-w-lg mx-auto px-5 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-8 animate-stagger-1">
          <button onClick={() => setLocation(-1 as any)} className="w-12 h-12 bg-secondary border border-white/5 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-serif font-semibold text-foreground tracking-tight">Notices</h1>
            <p className="text-xs text-primary font-medium tracking-widest uppercase mt-0.5">{unreadCount} Pending</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 h-12 px-4 rounded-xl border border-white/5 bg-secondary disabled:opacity-50"
            >
              <CheckCheck className="w-3 h-3" strokeWidth={2} /> Clear
            </button>
          )}
        </div>

        <div className="space-y-3 animate-stagger-2">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-[1.5rem] bg-secondary" />)
          ) : notifications?.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground glass-card rounded-[1.5rem]">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" strokeWidth={1.5} />
              <p className="font-serif text-lg text-foreground">You're caught up</p>
              <p className="text-xs mt-1">No new notices at this time.</p>
            </div>
          ) : (
            notifications?.map(n => (
              <div
                key={n.id}
                className={cn(
                  "glass-card rounded-[1.5rem] p-5 flex gap-4 cursor-pointer transition-all duration-300 relative overflow-hidden group",
                  !n.isRead ? "border-primary/20 bg-primary/5 hover:bg-primary/10" : "hover:bg-white/5"
                )}
                onClick={() => !n.isRead && markRead.mutate({ id: n.id })}
              >
                {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                
                <div className="w-12 h-12 rounded-xl bg-secondary border border-white/5 flex items-center justify-center shrink-0 text-xl group-hover:scale-110 transition-transform duration-300">
                  {notifIcons[n.type] || "🔔"}
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className={cn("text-base font-serif font-semibold tracking-tight", !n.isRead ? "text-primary" : "text-foreground")}>
                      {n.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest mt-2">
                    {new Date(n.createdAt).toLocaleString(undefined, {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})}
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
