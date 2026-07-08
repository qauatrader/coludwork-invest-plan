import { useState } from "react";
import {
  useGetAdminPaymentMethods, useCreatePaymentMethod, useUpdatePaymentMethod, useDeletePaymentMethod,
  getGetAdminPaymentMethodsQueryKey,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Wallet } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
  usdt_trc20: "USDT (TRC20)",
  usdt_bep20: "USDT (BEP20)",
  bank: "Bank Transfer",
};

function PaymentMethodForm({ method, onClose }: { method?: any; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: method?.name || "",
    type: method?.type || "jazzcash",
    accountNumber: method?.accountNumber || "",
    accountTitle: method?.accountTitle || "",
    isActive: method?.isActive ?? true,
  });

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const create = useCreatePaymentMethod({
    mutation: {
      onSuccess: () => {
        toast({ title: "Payment method added!" });
        queryClient.invalidateQueries({ queryKey: getGetAdminPaymentMethodsQueryKey() });
        onClose();
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  const update = useUpdatePaymentMethod({
    mutation: {
      onSuccess: () => {
        toast({ title: "Payment method updated!" });
        queryClient.invalidateQueries({ queryKey: getGetAdminPaymentMethodsQueryKey() });
        onClose();
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      type: form.type as any,
      accountNumber: form.accountNumber,
      accountTitle: form.accountTitle,
      isActive: form.isActive ?? true,
    };
    if (method) {
      update.mutate({ id: method.id, data });
    } else {
      create.mutate({ data });
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm">Display Name</Label>
        <Input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="e.g. JazzCash Main" required className="bg-secondary/50" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm">Method Type</Label>
        <Select value={form.type} onValueChange={v => setF("type", v)}>
          <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm">Account Title</Label>
        <Input value={form.accountTitle} onChange={e => setF("accountTitle", e.target.value)} placeholder="Account holder name" required className="bg-secondary/50" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm">Account Number / Wallet Address</Label>
        <Input value={form.accountNumber} onChange={e => setF("accountNumber", e.target.value)} placeholder="0300xxxxxxx or wallet address" required className="bg-secondary/50" />
      </div>
      <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
        <Label className="text-sm">Active (visible to users)</Label>
        <button
          type="button"
          onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
          className={`w-11 h-6 rounded-full transition-colors relative ${form.isActive ? "bg-primary" : "bg-muted"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.isActive ? "translate-x-5" : ""}`} />
        </button>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isPending}>
          {isPending ? "Saving..." : method ? "Update Method" : "Add Method"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminPaymentMethods() {
  const { data: methods, isLoading } = useGetAdminPaymentMethods();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMethod, setEditMethod] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMethod = useDeletePaymentMethod({
    mutation: {
      onSuccess: () => {
        toast({ title: "Payment method deleted" });
        queryClient.invalidateQueries({ queryKey: getGetAdminPaymentMethodsQueryKey() });
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Deposit methods shown to users on the wallet page</p>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => { setEditMethod(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Method
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
          ) : methods?.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground text-sm">
              No payment methods yet. Add one so users can deposit.
            </div>
          ) : methods?.map(method => (
            <div key={method.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{method.name}</p>
                    <p className="text-xs text-muted-foreground">{TYPE_LABELS[method.type] || method.type}</p>
                  </div>
                </div>
                <Badge className={method.isActive ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground"}>
                  {method.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="bg-secondary/50 rounded-lg p-2.5 text-xs space-y-1">
                <p className="text-muted-foreground">Account: <span className="text-foreground font-medium">{method.accountTitle}</span></p>
                <p className="text-muted-foreground">Number: <span className="text-foreground font-medium">{method.accountNumber}</span></p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditMethod(method); setDialogOpen(true); }}>
                  <Edit className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-400 border-red-400/30" onClick={() => {
                  if (confirm("Delete this payment method?")) deleteMethod.mutate({ id: method.id });
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
            <DialogTitle>{editMethod ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
          </DialogHeader>
          <PaymentMethodForm method={editMethod} onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
