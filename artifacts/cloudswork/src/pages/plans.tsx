import { useGetPlans, useGetPurchasedPlans, usePurchasePlan } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { TrendingUp, Clock, ShieldCheck, Sun, Briefcase, ChevronRight } from "lucide-react";
import {
  getGetPlansQueryKey, getGetPurchasedPlansQueryKey, getGetDashboardQueryKey
} from "@workspace/api-client-react";

function PlanCard({ plan, delay }: { plan: any; delay: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const purchase = usePurchasePlan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Portfolio Updated", description: `Successfully allocated funds to ${plan.name}` });
        queryClient.invalidateQueries({ queryKey: getGetPurchasedPlansQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Allocation Failed", description: err?.data?.error || "Insufficient liquid funds", variant: "destructive" });
      },
    },
  });

  const totalReturn = plan.price * (plan.dailyProfitRate / 100) * plan.durationDays;

  return (
    <div className={`glass-card rounded-[1.5rem] p-5 space-y-5 relative overflow-hidden group ${delay}`}>
      <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-primary/20 bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
            <Briefcase className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground tracking-tight">{plan.name}</h3>
            <p className="text-xs text-muted-foreground/80 tracking-wide">{plan.durationDays} Days Term</p>
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-widest">
          {plan.dailyProfitRate}% / DAY
        </div>
      </div>

      <p className="text-sm text-muted-foreground/90 leading-relaxed relative z-10">{plan.description}</p>

      <div className="grid grid-cols-3 gap-3 bg-secondary/50 rounded-xl p-4 border border-foreground/5 relative z-10">
        <div className="flex flex-col items-center">
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">Allocation</p>
          <p className="text-sm font-semibold text-foreground mt-1">Rs. {plan.price.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-center border-x border-border/50">
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">Daily Yield</p>
          <p className="text-sm font-semibold text-primary mt-1">
            Rs. {(plan.price * plan.dailyProfitRate / 100).toFixed(0)}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">Maturity</p>
          <p className="text-sm font-semibold text-foreground mt-1">Rs. {(plan.price + totalReturn).toFixed(0)}</p>
        </div>
      </div>

      <Button
        className="w-full h-12 rounded-xl vip-gradient text-background font-bold text-sm tracking-widest uppercase shadow-lg hover:shadow-primary/20 hover:scale-[0.98] transition-all duration-300 border-none relative z-10"
        onClick={() => purchase.mutate({ id: plan.id })}
        disabled={purchase.isPending}
      >
        {purchase.isPending ? "Processing..." : `Allocate Rs. ${plan.price.toLocaleString()}`}
      </Button>
    </div>
  );
}

function PurchasedPlanCard({ pp, delay }: { pp: any; delay: string }) {
  const plan = pp.plan;
  const progress = Math.max(0, Math.min(100,
    ((plan.durationDays - pp.daysRemaining) / plan.durationDays) * 100
  ));

  return (
    <div className={`glass-card rounded-[1.5rem] p-5 space-y-4 relative overflow-hidden group ${delay}`}>
      <div className="absolute right-0 bottom-0 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-foreground/5 bg-secondary">
            <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-serif text-base font-semibold text-foreground tracking-tight">{plan.name}</p>
            <p className="text-[11px] text-muted-foreground/80 tracking-wide uppercase">Rs. {plan.price.toLocaleString()} Allocated</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
          pp.status === "active"
            ? "bg-primary/10 text-primary border-primary/20"
            : "bg-secondary text-muted-foreground border-border"
        }`}>
          {pp.status}
        </span>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground/80 font-medium uppercase tracking-wider text-[10px]">Term Progress</span>
          <span className="text-foreground font-semibold">{pp.daysRemaining} days left</span>
        </div>
        <div className="h-1.5 bg-background rounded-full overflow-hidden border border-foreground/5">
          <div className="h-full vip-gradient rounded-full transition-all duration-1000 relative" style={{ width: `${progress}%` }}>
            <div className="absolute inset-0 bg-foreground/20 w-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-foreground/5 relative z-10">
        <div>
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">Daily Yield</p>
          <p className="text-sm font-semibold text-primary mt-0.5">Rs. {(plan.price * plan.dailyProfitRate / 100).toFixed(0)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">Realized</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">Rs. {pp.totalEarned.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">Maturity Date</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {new Date(pp.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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
      <div className="max-w-lg mx-auto px-5 pt-8 pb-6">
        <div className="mb-6 animate-stagger-1">
          <h1 className="text-3xl font-serif font-semibold text-foreground tracking-tight">Investment Plans</h1>
          <p className="text-sm text-muted-foreground/80 tracking-wide mt-1">Select a portfolio to begin earning yields</p>
        </div>

        <Tabs defaultValue="available" className="animate-stagger-2">
          <TabsList className="w-full mb-6 bg-secondary/50 p-1.5 rounded-xl border border-foreground/5 h-auto">
            <TabsTrigger value="available" className="flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-widest uppercase data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-widest uppercase data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">
              My Portfolio ({purchased?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4 mt-0">
            {plansLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-56 rounded-[1.5rem] bg-secondary" />)
            ) : plans?.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground glass-card rounded-[1.5rem]">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-serif text-lg text-foreground">No Opportunities</p>
                <p className="text-xs mt-1">Check back later for new allocations.</p>
              </div>
            ) : (
              plans?.map((plan, i) => (
                <PlanCard key={plan.id} plan={plan} delay={`animate-stagger-${Math.min(i + 1, 4)}`} />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4 mt-0">
            {purchasedLoading ? (
              Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-44 rounded-[1.5rem] bg-secondary" />)
            ) : purchased?.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground glass-card rounded-[1.5rem]">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-serif text-lg text-foreground">Empty Portfolio</p>
                <p className="text-xs mt-1">Allocate funds to a plan to start earning.</p>
              </div>
            ) : (
              purchased?.map((pp, i) => (
                <PurchasedPlanCard key={pp.id} pp={pp} delay={`animate-stagger-${Math.min(i + 1, 4)}`} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
