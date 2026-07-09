import { useState, useEffect, useRef } from "react";
import { useGetSupportMessages, useSendSupportMessage } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { getGetSupportMessagesQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Send, Headphones } from "lucide-react";
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
      <div className="max-w-lg mx-auto flex flex-col h-screen bg-background relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        
        <div className="flex items-center gap-4 px-5 py-5 border-b border-foreground/5 bg-background/80 backdrop-blur-xl z-10">
          <button onClick={() => setLocation(-1 as any)} className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-foreground/10 transition-colors border border-foreground/5">
            <ArrowLeft className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full vip-gradient p-[1px]">
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                <Headphones className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="font-serif font-semibold text-base text-foreground tracking-tight">Concierge</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Online</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 z-10 scroll-smooth">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                <Skeleton className="h-14 w-64 rounded-2xl bg-secondary" />
              </div>
            ))
          ) : messages?.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground h-full flex flex-col items-center justify-center">
              <Headphones className="w-12 h-12 mx-auto mb-4 opacity-20" strokeWidth={1.5} />
              <p className="font-serif text-lg text-foreground">Private Assistance</p>
              <p className="text-xs mt-1 tracking-wide">How may we assist with your portfolio today?</p>
            </div>
          ) : (
            messages?.map(msg => (
              <div
                key={msg.id}
                className={cn("flex", msg.isAdmin ? "justify-start" : "justify-end")}
              >
                {msg.isAdmin && (
                  <div className="w-8 h-8 rounded-full vip-gradient flex items-center justify-center p-[1px] mr-3 mt-auto mb-1 shrink-0">
                    <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                      <span className="text-[9px] font-bold text-primary font-serif">CS</span>
                    </div>
                  </div>
                )}
                <div className={cn(
                  "max-w-[75%] px-5 py-3 rounded-2xl text-[13px] leading-relaxed relative overflow-hidden",
                  msg.isAdmin
                    ? "glass-card text-foreground rounded-tl-sm border border-foreground/5"
                    : "vip-gradient text-background rounded-tr-sm font-medium shadow-lg"
                )}>
                  {!msg.isAdmin && <div className="absolute inset-0 bg-foreground/10 mix-blend-overlay pointer-events-none" />}
                  <p className="relative z-10">{msg.message}</p>
                  <p className={cn("text-[9px] uppercase tracking-widest mt-2 relative z-10 font-semibold", msg.isAdmin ? "text-muted-foreground" : "text-background/70")}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} className="h-4" />
        </div>

        <div className="px-5 py-4 border-t border-foreground/5 bg-background/80 backdrop-blur-xl z-10 safe-area-bottom">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Type your message..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-secondary/50 border-foreground/5 h-12 rounded-full px-5 focus:border-primary/50 focus:ring-primary/20 text-sm font-medium flex-1"
            />
            <Button
              size="icon"
              className="w-12 h-12 rounded-full vip-gradient text-background shrink-0 border-none shadow-lg hover:shadow-primary/20 hover:scale-[0.98] transition-all"
              onClick={handleSend}
              disabled={!text.trim() || send.isPending}
            >
              <Send className="w-4 h-4 ml-0.5" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
