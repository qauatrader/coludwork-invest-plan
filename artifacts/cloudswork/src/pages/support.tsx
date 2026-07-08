import { useState, useEffect, useRef } from "react";
import { useGetSupportMessages, useSendSupportMessage } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { getGetSupportMessagesQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function SupportPage() {
  const { data: messages, isLoading } = useGetSupportMessages();
  const [text, setText] = useState("");
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = useSendSupportMessage({
    mutation: {
      onSuccess: () => {
        setText("");
        queryClient.invalidateQueries({ queryKey: getGetSupportMessagesQueryKey() });
      },
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (text.trim()) {
      send.mutate({ data: { message: text.trim() } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppLayout hideNav>
      <div className="max-w-lg mx-auto flex flex-col h-screen">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
          <button onClick={() => setLocation("/")} className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">CloudsWork Support</p>
              <p className="text-xs text-primary">● Online</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                <Skeleton className="h-12 w-48 rounded-2xl" />
              </div>
            ))
          ) : messages?.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Start a conversation</p>
              <p className="text-xs mt-1">Our support team will respond shortly</p>
            </div>
          ) : (
            messages?.map(msg => (
              <div
                key={msg.id}
                className={cn("flex", msg.isAdmin ? "justify-start" : "justify-end")}
              >
                {msg.isAdmin && (
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 mt-auto mb-1 shrink-0">
                    CS
                  </div>
                )}
                <div className={cn(
                  "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                  msg.isAdmin
                    ? "bg-card border border-border text-foreground rounded-tl-sm"
                    : "bg-primary text-white rounded-tr-sm"
                )}>
                  <p>{msg.message}</p>
                  <p className={cn("text-xs mt-1", msg.isAdmin ? "text-muted-foreground" : "text-white/70")}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-3 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-secondary/50 flex-1"
            />
            <Button
              size="icon"
              className="bg-primary hover:bg-primary/90 shrink-0"
              onClick={handleSend}
              disabled={!text.trim() || send.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
