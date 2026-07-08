import { useState } from "react";
import { useGetAdminPlans, useCreatePlan, useUpdatePlan, useDeletePlan } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAdminPlansQueryKey } from "@workspace/api-client-react";
import { Plus, Edit, Trash2, Sun } from "lucide-react";

function PlanForm({ plan, onClose }: { plan?: any; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: plan?.name || "",
    price: String(plan?.price || ""),
    dailyProfitRate: String(plan?.dailyProfitRate || ""),
    durationDays: String(plan?.durationDays || ""),
    description: plan?.description || "",
    isActive: plan?.isActive ?? true,
  });

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const create = useCreatePlan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Plan created!" });
        queryClient.invalidateQueries({ queryKey: getGetAdminPlansQueryKey() });
        onClose();
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  const update = useUpdatePlan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Plan updated!" });
        queryClient.invalidateQueries({ queryKey: getGetAdminPlansQueryKey() });
        onClose();
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      price: parseFloat(form.price),
      dailyProfitRate: parseFloat(form.dailyProfitRate),
      durationDays: parseInt(form.durationDays),
      description: form.description,
      isActive: form.isActive ?? true,
    };
    if (plan) {
      update.mutate({ id: plan.id, data });
    } else {
      create.mutate({ data });
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm">Plan Name</Label>
        <Input value={form.name} onChange={e => setF("name", e.target.value)} required className="bg-secondary/50" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Price (PKR)</Label>
          <Input type="number" value={form.price} onChange={e => setF("price", e.target.value)} required className="bg-secondary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Daily Rate (%)</Label>
          <Input type="number" step="0.1" value={form.dailyProfitRate} onChange={e => setF("dailyProfitRate", e.target.value)} required className="bg-secondary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Duration (days)</Label>
          <Input type="number" value={form.durationDays} onChange={e => setF("durationDays", e.target.value)} required className="bg-secondary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Daily Profit</Label>
          <Input disabled value={form.price && form.dailyProfitRate ? `Rs.${(parseFloat(form.price) * parseFloat(form.dailyProfitRate) / 100).toFixed(0)}` : ""} className="bg-secondary/30" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm">Description</Label>
        <Textarea value={form.description} onChange={e => setF("description", e.target.value)} className="bg-secondary/50" rows={2} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isPending}>
          {isPending ? "Saving..." : plan ? "Update Plan" : "Create Plan"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminPlans() {
  const { data: plans, isLoading } = useGetAdminPlans();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deletePlan = useDeletePlan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Plan deleted" });
        queryClient.invalidateQueries({ queryKey: getGetAdminPlansQueryKey() });
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div />
          <Button className="bg-primary hover:bg-primary/90" onClick={() => { setEditPlan(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)
          ) : plans?.map(plan => (
            <div key={plan.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Sun className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.durationDays} days</p>
                  </div>
                </div>
                <Badge className={plan.isActive ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground"}>
                  {plan.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-secondary/50 rounded-lg p-2 text-center text-xs">
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-semibold text-foreground">Rs.{plan.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Daily</p>
                  <p className="font-semibold text-primary">{plan.dailyProfitRate}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Profit</p>
                  <p className="font-semibold text-foreground">Rs.{(plan.price * plan.dailyProfitRate / 100).toFixed(0)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditPlan(plan); setDialogOpen(true); }}>
                  <Edit className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-400 border-red-400/30" onClick={() => {
                  if (confirm("Delete this plan?")) deletePlan.mutate({ id: plan.id });
                }}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
          </DialogHeader>
          <PlanForm plan={editPlan} onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
