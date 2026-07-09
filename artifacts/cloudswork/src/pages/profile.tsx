import { useState } from "react";
import { useGetProfile, useUpdateProfile, useChangePassword, useLogout } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { getGetProfileQueryKey } from "@workspace/api-client-react";
import {
  User, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Award, LogOut, ShieldCheck, Edit3, Bell, Headphones
} from "lucide-react";
import { Link, useLocation } from "wouter";

function StatRow({ label, value, color = "" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-foreground/5 last:border-0 hover:bg-foreground/5 px-2 -mx-2 rounded-lg transition-colors">
      <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
      <span className={`text-base font-serif font-bold ${color || "text-foreground"}`}>{value}</span>
    </div>
  );
}

function ProfileTab() {
  const { data: profile, isLoading } = useGetProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);

  const update = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        toast({ title: "Profile updated" });
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        setEditing(false);
      },
      onError: (err: any) => {
        toast({ title: "Update Failed", description: err?.data?.error || "Could not update profile", variant: "destructive" });
      },
    },
  });

  const startEdit = () => {
    setNickname(profile?.nickname || "");
    setEmail(profile?.email || "");
    setEditing(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-stagger-2">
        <Skeleton className="h-32 rounded-[1.5rem] bg-secondary" />
        <Skeleton className="h-64 rounded-[1.5rem] bg-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-stagger-2">
      <div className="glass-card rounded-[1.5rem] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 rounded-full vip-gradient p-[2px] shadow-2xl flex-shrink-0">
            <div className="w-full h-full bg-background rounded-full flex items-center justify-center font-serif text-3xl font-bold text-primary border-4 border-background">
              {profile?.nickname?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-serif font-bold text-foreground tracking-tight truncate">{profile?.nickname}</p>
            <p className="text-[11px] text-muted-foreground/80 tracking-widest font-mono mt-1">{profile?.phone}</p>
            <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mt-2">
              <p className="text-[10px] font-bold tracking-widest uppercase text-primary">VIP Member</p>
            </div>
          </div>
          {!editing && (
            <button onClick={startEdit} className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center border border-foreground/5 hover:bg-foreground/10 transition-colors">
              <Edit3 className="w-4 h-4 text-foreground" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="glass-card rounded-[1.5rem] p-6 space-y-5">
          <h3 className="font-serif text-lg font-semibold text-foreground tracking-tight">Identity & Details</h3>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Alias</Label>
            <Input value={nickname} onChange={e => setNickname(e.target.value)} className="bg-background/50 border-foreground/10 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Email (optional)</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-background/50 border-foreground/10 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 font-medium" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 h-12 rounded-xl text-xs uppercase tracking-widest font-bold border-foreground/10 bg-secondary hover:bg-foreground/5" onClick={() => setEditing(false)}>Cancel</Button>
            <Button
              className="flex-1 h-12 rounded-xl vip-gradient text-background text-xs uppercase tracking-widest font-bold border-none shadow-lg hover:shadow-primary/20"
              onClick={() => update.mutate({ data: { nickname, email: email || undefined } })}
              disabled={update.isPending}
            >
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-[1.5rem] p-6">
          <h3 className="font-serif text-lg font-semibold text-foreground tracking-tight mb-4">Portfolio Statistics</h3>
          <div className="space-y-1">
            <StatRow label="Total Deposits" value={`Rs. ${(profile?.totalDeposit || 0).toLocaleString()}`} color="text-foreground" />
            <StatRow label="Total Disbursements" value={`Rs. ${(profile?.totalWithdraw || 0).toLocaleString()}`} color="text-foreground" />
            <StatRow label="Lifetime Yield" value={`Rs. ${(profile?.totalProfit || 0).toLocaleString()}`} color="text-primary" />
            <StatRow label="Network Royalties" value={`Rs. ${(profile?.totalCommission || 0).toLocaleString()}`} color="text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}

function SecurityTab() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = useChangePassword({
    mutation: {
      onSuccess: () => {
        toast({ title: "Private Key Updated" });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      },
      onError: (err: any) => {
        toast({ title: "Update Failed", description: err?.data?.error || "Could not change key", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Keys do not match", variant: "destructive" });
      return;
    }
    changePassword.mutate({ data: { currentPassword, newPassword, confirmPassword } });
  };

  return (
    <div className="glass-card rounded-[1.5rem] p-6 space-y-5 animate-stagger-2">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground tracking-tight">Security</h3>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-medium mt-0.5">Update Private Key</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Current Key</Label>
          <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="bg-background/50 border-foreground/10 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 font-medium" required />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">New Key</Label>
          <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-background/50 border-foreground/10 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 font-medium" required />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Verify New Key</Label>
          <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-background/50 border-foreground/10 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 font-medium" required />
        </div>
        <Button type="submit" className="w-full h-12 mt-2 rounded-xl vip-gradient text-background font-bold text-sm tracking-widest uppercase shadow-xl hover:shadow-primary/20 hover:scale-[0.98] transition-all duration-300 border-none" disabled={changePassword.isPending}>
          {changePassword.isPending ? "Updating..." : "Update Key"}
        </Button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-5 pt-8 pb-6">
        <div className="flex items-center justify-between mb-8 animate-stagger-1">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-foreground tracking-tight">Profile</h1>
            <p className="text-sm text-muted-foreground/80 tracking-wide mt-1">Manage your identity and security</p>
          </div>
          <div className="flex gap-3">
            <Link href="/support">
              <button className="w-12 h-12 bg-secondary border border-foreground/10 rounded-full flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all shadow-sm">
                <Headphones className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="profile" className="animate-stagger-1">
          <TabsList className="w-full mb-6 bg-secondary/50 p-1.5 rounded-xl border border-foreground/5 h-auto">
            <TabsTrigger value="profile" className="flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-widest uppercase data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">
               Identity
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-widest uppercase data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">
               Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="security" className="mt-0">
            <SecurityTab />
          </TabsContent>
        </Tabs>

        <Button
          variant="outline"
          className="w-full mt-8 h-14 rounded-2xl text-xs uppercase tracking-widest font-bold text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:text-red-400 transition-colors animate-stagger-3"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" strokeWidth={2} />
          Disconnect
        </Button>
      </div>
    </AppLayout>
  );
}
