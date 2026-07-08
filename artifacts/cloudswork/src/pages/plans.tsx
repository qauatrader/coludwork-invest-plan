import { useGetPlans, useGetPurchasedPlans, usePurchasePlan } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { TrendingUp, Clock, CheckCircle2, Sun } from "lucide-react";
import {
  getGetPlansQueryKey, getGetPurchasedPlansQueryKey, getGetDashboardQueryKey
} from "@workspace/api-client-react";

function PlanCard({ plan }: { plan: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const purchase = usePurchasePlan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Plan purchased!", description: `You've successfully purchased ${plan.name}` });
        queryClient.invalidateQueries({ queryKey: getGetPurchasedPlansQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Purchase failed", description: err?.data?.error || "Insufficient balance", variant: "destructive" });
      },
    },
  });

  const totalReturn = plan.price * (plan.dailyProfitRate / 100) * plan.durationDays;

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Sun className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{plan.name}</h3>
            <p className="text-xs text-muted-foreground">{plan.durationDays} days</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-primary border-primary/30 bg-primary/10">
          {plan.dailyProfitRate}%/day
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">{plan.description}</p>

      <div className="grid grid-cols-3 gap-2 bg-secondary/50 rounded-xl p-3">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="text-sm font-bold text-foreground">Rs.{plan.price.toLocaleString()}</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-xs text-muted-foreground">Daily</p>
          <p className="text-sm font-bold text-primary">
            Rs.{(plan.price * plan.dailyProfitRate / 100).toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-sm font-bold text-foreground">Rs.{(plan.price + totalReturn).toFixed(0)}</p>
        </div>
      </div>

      <Button
        className="w-full bg-primary hover:bg-primary/90"
        onClick={() => purchase.mutate({ id: plan.id })}
        disabled={purchase.isPending}
      >
        {purchase.isPending ? "Processing..." : `Invest Rs.${plan.price.toLocaleString()}`}
      </Button>
    </div>
  );
}

function PurchasedPlanCard({ pp }: { pp: any }) {
  const plan = pp.plan;
  const progress = Math.max(0, Math.min(100,
    ((plan.durationDays - pp.daysRemaining) / plan.durationDays) * 100
  ));

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Sun className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">{plan.name}</p>
            <p className="text-xs text-muted-foreground">Rs.{plan.price.toLocaleString()} invested</p>
          </div>
        </div>
        <Badge className={
          pp.status === "active"
            ? "bg-primary/10 text-primary border-primary/20"
            : "bg-secondary text-muted-foreground"
        }>
          {pp.status}
        </Badge>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground">{pp.daysRemaining}d remaining</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Daily Profit</p>
          <p className="font-semibold text-primary">Rs.{(plan.price * plan.dailyProfitRate / 100).toFixed(0)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total Earned</p>
          <p className="font-semibold text-foreground">Rs.{pp.totalEarned.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Ends</p>
          <p className="font-semibold text-foreground text-xs">
            {new Date(pp.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PlansPage() {
  const { data: plans, isLoading: plansLoading } = useGetPlans();
  const { data: purchased, isLoading: purchasedLoading } = useGetPurchasedPlans();

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground">Investment Plans</h1>
          <p className="text-sm text-muted-foreground">Choose a plan and earn daily profits</p>
        </div>

        <Tabs defaultValue="available">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="available" className="flex-1">
              <TrendingUp className="w-4 h-4 mr-1.5" />
              Available
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              My Plans ({purchased?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-3 mt-0">
            {plansLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)
            ) : plans?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No plans available</p>
              </div>
            ) : (
              plans?.map(plan => <PlanCard key={plan.id} plan={plan} />)
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-3 mt-0">
            {purchasedLoading ? (
              Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
            ) : purchased?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No active plans</p>
                <p className="text-xs mt-1">Purchase a plan to start earning</p>
              </div>
            ) : (
              purchased?.map(pp => <PurchasedPlanCard key={pp.id} pp={pp} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
