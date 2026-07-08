import { useGetReferral, useGetReferralTeam } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, TrendingUp, Award } from "lucide-react";

function LevelBadge({ level }: { level: number }) {
  const colors = ["bg-yellow-500/10 text-yellow-400 border-yellow-500/20", "bg-blue-500/10 text-blue-400 border-blue-500/20", "bg-purple-500/10 text-purple-400 border-purple-500/20"];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors[level - 1]}`}>
      L{level}
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
      toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    }
  };

  const copyCode = () => {
    if (referral?.referralCode) {
      navigator.clipboard.writeText(referral.referralCode);
      toast({ title: "Copied!", description: "Referral code copied" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground">Referral Program</h1>
          <p className="text-sm text-muted-foreground">Earn commissions from your team</p>
        </div>

        {/* Commission rates */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-foreground mb-3">Commission Rates</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { level: 1, rate: referral?.level1Rate || 7 },
              { level: 2, rate: referral?.level2Rate || 3 },
              { level: 3, rate: referral?.level3Rate || 1 },
            ].map(({ level, rate }) => (
              <div key={level} className="text-center">
                <LevelBadge level={level} />
                <p className="text-xl font-bold text-foreground mt-2">{rate}%</p>
                <p className="text-xs text-muted-foreground">Level {level}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : (
            <>
              <div className="bg-card border border-border rounded-xl p-3">
                <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-2">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="text-xs text-muted-foreground">Total Commission</p>
                <p className="text-base font-bold text-foreground">Rs.{(referral?.totalCommission || 0).toLocaleString()}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <Award className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Today's Commission</p>
                <p className="text-base font-bold text-primary">Rs.{(referral?.todayCommission || 0).toLocaleString()}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xs text-muted-foreground">Total Team</p>
                <p className="text-base font-bold text-foreground">{referral?.totalReferrals || 0}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Team Breakdown</p>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-yellow-400">L1:</span>
                    <span className="text-foreground">{referral?.level1Count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400">L2:</span>
                    <span className="text-foreground">{referral?.level2Count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">L3:</span>
                    <span className="text-foreground">{referral?.level3Count || 0}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Referral Link */}
        <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Your Referral Code</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 font-mono text-sm text-primary font-semibold">
              {referral?.referralCode || "Loading..."}
            </div>
            <Button size="sm" variant="outline" onClick={copyCode} className="shrink-0">
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-sm font-medium text-foreground">Referral Link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-xs text-muted-foreground truncate">
              {referral?.referralLink || "Loading..."}
            </div>
            <Button size="sm" onClick={copyLink} className="shrink-0 bg-primary hover:bg-primary/90">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Team */}
        <Tabs defaultValue="level1">
          <TabsList className="w-full mb-3">
            <TabsTrigger value="level1" className="flex-1">L1 ({team?.level1?.length || 0})</TabsTrigger>
            <TabsTrigger value="level2" className="flex-1">L2 ({team?.level2?.length || 0})</TabsTrigger>
            <TabsTrigger value="level3" className="flex-1">L3 ({team?.level3?.length || 0})</TabsTrigger>
          </TabsList>

          {["level1", "level2", "level3"].map((lvl, i) => (
            <TabsContent key={lvl} value={lvl} className="mt-0">
              <div className="space-y-2">
                {teamLoading ? (
                  Array(2).fill(0).map((_, j) => <Skeleton key={j} className="h-14 rounded-xl" />)
                ) : (team as any)?.[lvl]?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No Level {i + 1} referrals yet</p>
                  </div>
                ) : (
                  (team as any)?.[lvl]?.map((member: any) => (
                    <div key={member.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-semibold text-sm">
                          {member.nickname[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.nickname}</p>
                          <p className="text-xs text-muted-foreground">{member.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-primary font-medium">Rs.{member.depositBalance.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(member.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
