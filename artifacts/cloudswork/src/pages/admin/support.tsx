import { useState } from "react";
import { useGetAdminSupportTickets, useAdminReplySupportMessage } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAdminSupportTicketsQueryKey } from "@workspace/api-client-react";
import { MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

function useAdminUserMessages(userId: number | null) {
  return useQuery({
    queryKey: ["admin-support-messages", userId],
    queryFn: async () => {
      if (!userId) return [];
      const token = localStorage.getItem("cw_token");
      const res = await fetch(`/api/admin/support/${userId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
    refetchInterval: 5000,
  });
}

export default function AdminSupport() {
  const { data: tickets, isLoading: ticketsLoading } = useGetAdminSupportTickets();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const queryClient = useQueryClient();

  const { data: messages, isLoading: messagesLoading } = useAdminUserMessages(selectedUserId);

  const selectedTicket = tickets?.find((t: any) => t.userId === selectedUserId);

  const sendReply = useAdminReplySupportMessage({
    mutation: {
      onSuccess: () => {
        setReply("");
        queryClient.invalidateQueries({ queryKey: ["admin-support-messages", selectedUserId] });
        queryClient.invalidateQueries({ queryKey: getGetAdminSupportTicketsQueryKey() });
      },
    },
  });

  return (
    <AdminLayout>
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        {/* Ticket list */}
        <div className="w-64 shrink-0 bg-card border border-border rounded-xl overflow-y-auto">
          <div className="p-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">Support Tickets</p>
            <p className="text-xs text-muted-foreground">{tickets?.length || 0} conversations</p>
          </div>
          <div className="divide-y divide-border">
            {ticketsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="p-3"><Skeleton className="h-12 rounded-lg" /></div>
              ))
            ) : tickets?.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                <MessageSquare className="w-6 h-6 mx-auto mb-1 opacity-30" />
                No tickets
              </div>
            ) : (tickets as any[])?.map((ticket: any) => (
              <button
                key={ticket.userId}
                onClick={() => setSelectedUserId(ticket.userId)}
                className={cn(
                  "w-full text-left p-3 hover:bg-secondary/50 transition-colors",
                  selectedUserId === ticket.userId && "bg-primary/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                    {ticket.nickname?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ticket.nickname || `User #${ticket.userId}`}</p>
                    <p className="text-xs text-muted-foreground truncate">{ticket.lastMessage}</p>
                  </div>
                </div>
                {ticket.unreadCount > 0 && (
                  <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-primary text-primary-foreground">
                    {ticket.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
          {!selectedUserId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Select a ticket to view messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border">
                <p className="text-sm font-medium text-foreground">
                  {selectedTicket?.userNickname || `User #${selectedUserId}`}
                </p>
                <p className="text-xs text-muted-foreground">User ID: {selectedUserId}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)
                ) : !messages || messages.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    No messages yet
                  </div>
                ) : messages?.map((msg: any) => (
                  <div key={msg.id} className={cn("flex", msg.isAdmin ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                      msg.isAdmin
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-secondary text-foreground rounded-tl-sm"
                    )}>
                      <p>{msg.message}</p>
                      <p className={cn("text-xs mt-1", msg.isAdmin ? "text-foreground/70" : "text-muted-foreground")}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border flex gap-2">
                <Input
                  placeholder="Type a reply..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  className="bg-secondary/50"
                  onKeyDown={e => {
                    if (e.key === "Enter" && reply.trim()) {
                      sendReply.mutate({ userId: selectedUserId, data: { message: reply.trim() } });
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="bg-primary hover:bg-primary/90 shrink-0"
                  disabled={!reply.trim() || sendReply.isPending}
                  onClick={() => sendReply.mutate({ userId: selectedUserId, data: { message: reply.trim() } })}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
