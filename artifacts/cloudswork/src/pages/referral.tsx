import { useGetReferral, useGetReferralTeam } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, Activity, Crown } from "lucide-react";

function LevelBadge({ level }: { level: number }) {
  const configs = [
    { bg: "bg-[#E4B856]/10", border: "border-[#E4B856]/30", text: "text-[#E4B856]", name: "Tier I" },
    { bg: "bg-slate-300/10", border: "border-slate-300/30", text: "text-slate-300", name: "Tier II" },
    { bg: "bg-[#CD7F32]/10", border: "border-[#CD7F32]/30", text: "text-[#CD7F32]", name: "Tier III" },
  ];
  const conf = configs[level - 1];
  return (
    <span className={`text-[10px] px-3 py-1 rounded-full border font-bold uppercase tracking-widest ${conf.bg} ${conf.border} ${conf.text}`}>
      {conf.name}
    </span>
  );
}

export default function ReferralPage() {
  const { data: referral, isLoading } = useGetReferral();
  const { data: team, isLoading: teamLoading } = useGetReferralTeam();
  const { toast } = useToast();

  const copyLink = () => {
    if (referral?.referralLink) {
      navigator.clipboard.writeText(referral.referralLink);
      toast({ title: "Link Copied", description: "Private invitation link copied to clipboard" });
    }
  };

  const copyCode = () => {
    if (referral?.referralCode) {
      navigator.clipboard.writeText(referral.referralCode);
      toast({ title: "Code Copied", description: "Invitation code copied" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-5 pt-8 pb-6">
        <div className="mb-6 animate-stagger-1">
          <h1 className="text-3xl font-serif font-semibold text-foreground tracking-tight">Wealth Network</h1>
          <p className="text-sm text-muted-foreground/80 tracking-wide mt-1">Expand your circle, amplify your returns</p>
        </div>

        {/* Commission rates */}
        <div className="glass-card rounded-[1.5rem] p-5 mb-6 relative overflow-hidden animate-stagger-1">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground/80 font-semibold mb-4">Commission Structure</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { level: 1, rate: referral?.level1Rate || 7 },
              { level: 2, rate: referral?.level2Rate || 3 },
              { level: 3, rate: referral?.level3Rate || 1 },
            ].map(({ level, rate }) => (
              <div key={level} className="flex flex-col items-center p-3 rounded-2xl bg-secondary/50 border border-foreground/5">
                <LevelBadge level={level} />
                <p className="text-2xl font-serif font-semibold text-foreground mt-3 tracking-tight">{rate}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 animate-stagger-2">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl bg-secondary" />)
          ) : (
            <>
              <div className="glass-card border border-foreground/5 rounded-2xl p-4 relative overflow-hidden">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3 border border-primary/20">
                  <Crown className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <p className="text-[10px] text-muted-foreground/80 uppercase tracking-widest font-semibold">Total Royalties</p>
                <p className="text-lg font-serif font-semibold text-foreground tracking-tight mt-1">Rs. {(referral?.totalCommission || 0).toLocaleString()}</p>
              </div>
              <div className="glass-card border border-foreground/5 rounded-2xl p-4 relative overflow-hidden">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3 border border-primary/20">
                  <Activity className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <p className="text-[10px] text-muted-foreground/80 uppercase tracking-widest font-semibold">Today's Royalties</p>
                <p className="text-lg font-serif font-semibold text-primary tracking-tight mt-1">Rs. {(referral?.todayCommission || 0).toLocaleString()}</p>
              </div>
              <div className="glass-card border border-foreground/5 rounded-2xl p-4 relative overflow-hidden">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center mb-3 border border-foreground/10">
                  <Users className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-[10px] text-muted-foreground/80 uppercase tracking-widest font-semibold">Network Size</p>
                <p className="text-lg font-serif font-semibold text-foreground tracking-tight mt-1">{referral?.totalReferrals || 0}</p>
              </div>
              <div className="glass-card border border-foreground/5 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-center">
                <p className="text-[10px] text-muted-foreground/80 uppercase tracking-widest font-semibold mb-3">Tier Breakdown</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center bg-secondary/30 px-2 py-1 rounded border border-foreground/5">
                    <span className="text-[#E4B856] font-semibold tracking-wider">T1</span>
                    <span className="text-foreground font-mono">{referral?.level1Count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-secondary/30 px-2 py-1 rounded border border-foreground/5">
                    <span className="text-slate-300 font-semibold tracking-wider">T2</span>
                    <span className="text-foreground font-mono">{referral?.level2Count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-secondary/30 px-2 py-1 rounded border border-foreground/5">
                    <span className="text-[#CD7F32] font-semibold tracking-wider">T3</span>
                    <span className="text-foreground font-mono">{referral?.level3Count || 0}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Referral Link */}
        <div className="glass-card border border-foreground/5 rounded-[1.5rem] p-5 mb-6 space-y-5 animate-stagger-3 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground/80 font-semibold mb-2">Invitation Code</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-secondary/80 border border-foreground/5 rounded-xl px-4 py-3 font-mono text-base text-primary font-bold tracking-widest">
                {referral?.referralCode || "Loading..."}
              </div>
              <button onClick={copyCode} className="h-12 px-4 rounded-xl bg-secondary border border-foreground/10 hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-colors active:scale-95 flex items-center justify-center shrink-0">
                <Copy className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground/80 font-semibold mb-2">Private Link</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-secondary/80 border border-foreground/5 rounded-xl px-4 py-3 font-mono text-[10px] text-muted-foreground truncate tracking-wider">
                {referral?.referralLink || "Loading..."}
              </div>
              <button onClick={copyLink} className="h-[42px] px-6 rounded-xl vip-gradient text-background text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-primary/20 hover:scale-[0.98] transition-all shrink-0">
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="animate-stagger-4">
          <Tabs defaultValue="level1">
            <TabsList className="w-full mb-4 bg-secondary/50 p-1.5 rounded-xl border border-foreground/5 h-auto">
              <TabsTrigger value="level1" className="flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-widest uppercase data-[state=active]:bg-card data-[state=active]:text-primary transition-all">T1 ({team?.level1?.length || 0})</TabsTrigger>
              <TabsTrigger value="level2" className="flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-widest uppercase data-[state=active]:bg-card data-[state=active]:text-primary transition-all">T2 ({team?.level2?.length || 0})</TabsTrigger>
              <TabsTrigger value="level3" className="flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-widest uppercase data-[state=active]:bg-card data-[state=active]:text-primary transition-all">T3 ({team?.level3?.length || 0})</TabsTrigger>
            </TabsList>

            {["level1", "level2", "level3"].map((lvl, i) => (
              <TabsContent key={lvl} value={lvl} className="mt-0">
                <div className="space-y-3">
                  {teamLoading ? (
                    Array(3).fill(0).map((_, j) => <Skeleton key={j} className="h-16 rounded-2xl bg-secondary" />)
                  ) : (team as any)?.[lvl]?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground glass-card rounded-[1.5rem]">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="font-serif text-lg text-foreground">No Members Found</p>
                      <p className="text-xs mt-1">Tier {i + 1} of your network is currently empty.</p>
                    </div>
                  ) : (
                    (team as any)?.[lvl]?.map((member: any) => (
                      <div key={member.id} className="glass-card border border-foreground/5 rounded-2xl p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-secondary border border-foreground/10 rounded-xl flex items-center justify-center font-serif text-lg text-primary group-hover:border-primary/30 transition-colors">
                            {member.nickname[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground tracking-tight">{member.nickname}</p>
                            <p className="text-[10px] text-muted-foreground/80 tracking-widest font-mono mt-0.5">{member.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary tracking-tight">Rs. {member.depositBalance.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mt-0.5">{new Date(member.joinedAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
