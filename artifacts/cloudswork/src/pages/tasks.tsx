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
  check_in: "bg-primary/10 text-primary",
  watch_video: "bg-blue-500/10 text-blue-400",
  visit_website: "bg-yellow-500/10 text-yellow-400",
  share_link: "bg-purple-500/10 text-purple-400",
};

function TaskCard({ task }: { task: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const Icon = taskIcons[task.type] || CheckSquare;

  const complete = useCompleteTask({
    mutation: {
      onSuccess: (data) => {
        toast({
          title: "Task completed!",
          description: `You earned Rs.${data.reward}`,
        });
        queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
      },
      onError: (err: any) => {
        toast({
          title: "Already completed",
          description: err?.data?.error || "Task already done today",
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
    <div className={`bg-card border rounded-xl p-4 flex items-center gap-4 transition-all ${
      task.isCompleted ? "border-primary/30 opacity-70" : "border-border"
    }`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${taskColors[task.type] || "bg-secondary"}`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-foreground">{task.title}</p>
          {task.isCompleted && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-1.5 py-0">
              Done
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{task.description}</p>
        <p className="text-xs font-medium text-primary mt-1">+Rs.{task.reward} reward</p>
      </div>

      <Button
        size="sm"
        className={task.isCompleted
          ? "bg-secondary text-muted-foreground cursor-not-allowed border border-border"
          : "bg-primary hover:bg-primary/90"
        }
        disabled={task.isCompleted || complete.isPending}
        onClick={handleComplete}
      >
        {task.isCompleted ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : complete.isPending ? (
          "..."
        ) : (
          "Claim"
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
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground">Daily Tasks</h1>
          <p className="text-sm text-muted-foreground">Complete tasks to earn bonus rewards</p>
        </div>

        {/* Progress */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-foreground">Daily Progress</p>
              <p className="text-xs text-muted-foreground">{completedCount} of {tasks?.length || 0} tasks done</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Earned today</p>
              <p className="text-base font-bold text-primary">Rs.{earnedToday}</p>
            </div>
          </div>

          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: tasks?.length ? `${(completedCount / tasks.length) * 100}%` : "0%" }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>0</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Resets daily at midnight
            </span>
            <span>Rs.{totalReward}</span>
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : tasks?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No tasks available</p>
            </div>
          ) : (
            tasks?.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </div>
    </AppLayout>
  );
}
