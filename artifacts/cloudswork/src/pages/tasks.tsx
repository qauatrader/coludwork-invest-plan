import { useGetTasks, useCompleteTask } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetTasksQueryKey, getGetDashboardQueryKey, getGetWalletQueryKey } from "@workspace/api-client-react";
import { CheckCircle2, Clock, PlayCircle, ExternalLink, Share2, CheckSquare } from "lucide-react";

const taskIcons: Record<string, any> = {
  check_in: CheckCircle2,
  watch_video: PlayCircle,
  visit_website: ExternalLink,
  share_link: Share2,
};

const taskColors: Record<string, string> = {
  check_in: "bg-[#E4B856]/10 text-[#E4B856] border-[#E4B856]/20",
  watch_video: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  visit_website: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  share_link: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

function TaskCard({ task, delay }: { task: any; delay: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const Icon = taskIcons[task.type] || CheckSquare;

  const complete = useCompleteTask({
    mutation: {
      onSuccess: (data) => {
        toast({
          title: "Bounty Claimed",
          description: `Rs. ${data.reward} added to your portfolio`,
        });
        queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
      },
      onError: (err: any) => {
        toast({
          title: "Claim Failed",
          description: err?.data?.error || "Task already claimed today",
          variant: "destructive",
        });
      },
    },
  });

  const handleComplete = () => {
    if (task.link && task.type !== "check_in") {
      window.open(task.link, "_blank");
    }
    complete.mutate({ id: task.id });
  };

  return (
    <div className={`glass-card rounded-[1.5rem] p-5 flex items-center gap-4 transition-all duration-300 relative overflow-hidden group ${
      task.isCompleted ? "opacity-60 grayscale-[30%]" : "hover:bg-foreground/5"
    } ${delay}`}>
      {task.isCompleted && <div className="absolute inset-0 bg-background/40 z-10 pointer-events-none" />}
      
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${taskColors[task.type] || "bg-secondary border-foreground/5"}`}>
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-serif font-semibold text-foreground tracking-tight">{task.title}</p>
          {task.isCompleted && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-widest px-2 py-0">
              Claimed
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/80 tracking-wide line-clamp-2">{task.description}</p>
        <p className="text-xs font-semibold text-primary mt-2 tracking-tight">+ Rs. {task.reward}</p>
      </div>

      <Button
        size="sm"
        className={`shrink-0 h-10 px-4 rounded-xl uppercase tracking-widest text-[10px] font-bold transition-all duration-300 relative z-20 ${
          task.isCompleted
            ? "bg-secondary text-muted-foreground border border-foreground/5 shadow-none"
            : "vip-gradient text-background shadow-lg hover:shadow-primary/20 hover:scale-[0.98] border-none"
        }`}
        disabled={task.isCompleted || complete.isPending}
        onClick={handleComplete}
      >
        {task.isCompleted ? (
          <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
        ) : complete.isPending ? (
          "..."
        ) : (
          "Execute"
        )}
      </Button>
    </div>
  );
}

export default function TasksPage() {
  const { data: tasks, isLoading } = useGetTasks();

  const completedCount = tasks?.filter(t => t.isCompleted).length || 0;
  const totalReward = tasks?.reduce((sum, t) => sum + t.reward, 0) || 0;
  const earnedToday = tasks?.filter(t => t.isCompleted).reduce((sum, t) => sum + t.reward, 0) || 0;

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-5 pt-8 pb-6">
        <div className="mb-6 animate-stagger-1">
          <h1 className="text-3xl font-serif font-semibold text-foreground tracking-tight">Privileges</h1>
          <p className="text-sm text-muted-foreground/80 tracking-wide mt-1">Exclusive daily bounties for members</p>
        </div>

        {/* Progress */}
        <div className="glass-card rounded-[1.5rem] p-6 mb-8 relative overflow-hidden animate-stagger-1">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground/80 font-semibold mb-1">Daily Objectives</p>
              <p className="text-sm font-serif font-medium text-foreground tracking-tight">{completedCount} of {tasks?.length || 0} Complete</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-muted-foreground/80 font-semibold mb-1">Bounties Secured</p>
              <p className="text-xl font-serif font-bold text-primary tracking-tight">Rs. {earnedToday}</p>
            </div>
          </div>

          <div className="h-2 bg-background rounded-full overflow-hidden border border-foreground/5 relative z-10">
            <div
              className="h-full vip-gradient rounded-full transition-all duration-1000 relative"
              style={{ width: tasks?.length ? `${(completedCount / tasks.length) * 100}%` : "0%" }}
            >
              <div className="absolute inset-0 bg-foreground/20 w-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold relative z-10">
            <span>0</span>
            <span className="flex items-center gap-1.5 text-primary/80">
              <Clock className="w-3 h-3" strokeWidth={2} /> Resets at Midnight
            </span>
            <span>Rs. {totalReward}</span>
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-[1.5rem] bg-secondary animate-stagger-2" />)
          ) : tasks?.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground glass-card rounded-[1.5rem] animate-stagger-2">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-serif text-lg text-foreground">No Active Privileges</p>
              <p className="text-xs mt-1">Please check back tomorrow.</p>
            </div>
          ) : (
            tasks?.map((task, i) => <TaskCard key={task.id} task={task} delay={`animate-stagger-${Math.min(i + 1, 4)}`} />)
          )}
        </div>
      </div>
    </AppLayout>
  );
}
