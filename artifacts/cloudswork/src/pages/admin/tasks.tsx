import { useState } from "react";
import { useGetAdminTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAdminTasksQueryKey } from "@workspace/api-client-react";
import { Plus, Edit, Trash2, CheckSquare } from "lucide-react";

function TaskForm({ task, onClose }: { task?: any; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    type: task?.type || "check_in",
    reward: String(task?.reward || ""),
    link: task?.link || "",
    isActive: task?.isActive ?? true,
  });

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const create = useCreateTask({
    mutation: {
      onSuccess: () => {
        toast({ title: "Task created!" });
        queryClient.invalidateQueries({ queryKey: getGetAdminTasksQueryKey() });
        onClose();
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  const update = useUpdateTask({
    mutation: {
      onSuccess: () => {
        toast({ title: "Task updated!" });
        queryClient.invalidateQueries({ queryKey: getGetAdminTasksQueryKey() });
        onClose();
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: form.title,
      description: form.description,
      type: form.type as any,
      reward: parseFloat(form.reward),
      link: form.link || undefined,
      isActive: form.isActive ?? true,
    };
    if (task) update.mutate({ id: task.id, data });
    else create.mutate({ data });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm">Title</Label>
        <Input value={form.title} onChange={e => setF("title", e.target.value)} required className="bg-secondary/50" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm">Description</Label>
        <Textarea value={form.description} onChange={e => setF("description", e.target.value)} className="bg-secondary/50" rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Type</Label>
          <Select value={form.type} onValueChange={v => setF("type", v)}>
            <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="check_in">Daily Check-in</SelectItem>
              <SelectItem value="watch_video">Watch Video</SelectItem>
              <SelectItem value="visit_website">Visit Website</SelectItem>
              <SelectItem value="share_link">Share Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Reward (PKR)</Label>
          <Input type="number" value={form.reward} onChange={e => setF("reward", e.target.value)} required className="bg-secondary/50" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm">Link (optional)</Label>
        <Input placeholder="https://" value={form.link} onChange={e => setF("link", e.target.value)} className="bg-secondary/50" />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={create.isPending || update.isPending}>
          {create.isPending || update.isPending ? "Saving..." : task ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminTasks() {
  const { data: tasks, isLoading } = useGetAdminTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteTask = useDeleteTask({
    mutation: {
      onSuccess: () => {
        toast({ title: "Task deleted" });
        queryClient.invalidateQueries({ queryKey: getGetAdminTasksQueryKey() });
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div />
          <Button className="bg-primary hover:bg-primary/90" onClick={() => { setEditTask(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Task
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : tasks?.map((task: any) => (
            <div key={task.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-sm text-foreground">{task.title}</p>
                  <Badge className={task.isActive ? "bg-primary/10 text-primary border-primary/20 text-xs" : "bg-secondary text-muted-foreground text-xs"}>
                    {task.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{task.description}</p>
                <p className="text-xs text-primary font-medium mt-1">+Rs.{task.reward} • {task.type?.replace("_", " ")}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => { setEditTask(task); setDialogOpen(true); }}>
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="text-red-400 border-red-400/30" onClick={() => {
                  if (confirm("Delete this task?")) deleteTask.mutate({ id: task.id });
                }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editTask ? "Edit Task" : "Create Task"}</DialogTitle>
          </DialogHeader>
          <TaskForm task={editTask} onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
