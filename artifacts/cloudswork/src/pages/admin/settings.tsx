import { useState, useEffect } from "react";
import { useGetAdminSettings, useUpdateAdminSettings } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAdminSettingsQueryKey } from "@workspace/api-client-react";
import { Settings, Save } from "lucide-react";

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetAdminSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    siteName: "",
    withdrawalFeePercent: "",
    minDeposit: "",
    minWithdrawal: "",
    referralLevel1Rate: "",
    referralLevel2Rate: "",
    referralLevel3Rate: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        siteName: settings.siteName || "",
        withdrawalFeePercent: String(settings.withdrawalFeePercent || ""),
        minDeposit: String(settings.minDeposit || ""),
        minWithdrawal: String(settings.minWithdrawal || ""),
        referralLevel1Rate: String(settings.referralLevel1Rate || ""),
        referralLevel2Rate: String(settings.referralLevel2Rate || ""),
        referralLevel3Rate: String(settings.referralLevel3Rate || ""),
      });
    }
  }, [settings]);

  const update = useUpdateAdminSettings({
    mutation: {
      onSuccess: () => {
        toast({ title: "Settings saved!" });
        queryClient.invalidateQueries({ queryKey: getGetAdminSettingsQueryKey() });
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    },
  });

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({
      data: {
        siteName: form.siteName,
        withdrawalFeePercent: parseFloat(form.withdrawalFeePercent),
        minDeposit: parseFloat(form.minDeposit),
        minWithdrawal: parseFloat(form.minWithdrawal),
        referralLevel1Rate: parseFloat(form.referralLevel1Rate),
        referralLevel2Rate: parseFloat(form.referralLevel2Rate),
        referralLevel3Rate: parseFloat(form.referralLevel3Rate),
      },
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Platform Settings</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(7).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="font-medium text-foreground text-sm">General</h3>
              <div className="space-y-1.5">
                <Label className="text-sm">Site Name</Label>
                <Input value={form.siteName} onChange={e => setF("siteName", e.target.value)} className="bg-secondary/50" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="font-medium text-foreground text-sm">Financial Limits</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Min Deposit (PKR)</Label>
                  <Input type="number" value={form.minDeposit} onChange={e => setF("minDeposit", e.target.value)} className="bg-secondary/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Min Withdrawal (PKR)</Label>
                  <Input type="number" value={form.minWithdrawal} onChange={e => setF("minWithdrawal", e.target.value)} className="bg-secondary/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Withdrawal Fee (%)</Label>
                  <Input type="number" step="0.1" value={form.withdrawalFeePercent} onChange={e => setF("withdrawalFeePercent", e.target.value)} className="bg-secondary/50" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="font-medium text-foreground text-sm">Referral Commission Rates</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Level 1 Rate (%)", key: "referralLevel1Rate" },
                  { label: "Level 2 Rate (%)", key: "referralLevel2Rate" },
                  { label: "Level 3 Rate (%)", key: "referralLevel3Rate" },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-sm">{label}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={(form as any)[key]}
                      onChange={e => setF(key, e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={update.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {update.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
