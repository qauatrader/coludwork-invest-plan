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
  Award, LogOut, ShieldCheck, Edit3, Bell
} from "lucide-react";
import { Link, useLocation } from "wouter";

function StatRow({ label, value, color = "" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${color || "text-foreground"}`}>{value}</span>
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
        toast({ title: "Profile updated!" });
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        setEditing(false);
      },
      onError: (err: any) => {
        toast({ title: "Failed", description: err?.data?.error || "Update failed", variant: "destructive" });
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
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary">
            {profile?.nickname?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-foreground">{profile?.nickname}</p>
            <p className="text-sm text-muted-foreground">{profile?.phone}</p>
            <p className="text-xs text-muted-foreground">Member since {new Date(profile?.memberSince || "").toLocaleDateString()}</p>
          </div>
          {!editing && (
            <button onClick={startEdit} className="p-2 bg-secondary rounded-lg">
              <Edit3 className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h3 className="font-medium text-foreground">Edit Profile</h3>
          <div className="space-y-1.5">
            <Label className="text-sm">Nickname</Label>
            <Input value={nickname} onChange={e => setNickname(e.target.value)} className="bg-secondary/50" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Email (optional)</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-secondary/50" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => update.mutate({ data: { nickname, email: email || undefined } })}
              disabled={update.isPending}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-medium text-foreground mb-2">Investment Stats</h3>
          <StatRow label="Total Deposit" value={`Rs.${(profile?.totalDeposit || 0).toLocaleString()}`} color="text-blue-400" />
          <StatRow label="Total Withdraw" value={`Rs.${(profile?.totalWithdraw || 0).toLocaleString()}`} color="text-orange-400" />
          <StatRow label="Total Profit" value={`Rs.${(profile?.totalProfit || 0).toLocaleString()}`} color="text-primary" />
          <StatRow label="Total Commission" value={`Rs.${(profile?.totalCommission || 0).toLocaleString()}`} color="text-yellow-400" />
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
        toast({ title: "Password changed!" });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      },
      onError: (err: any) => {
        toast({ title: "Failed", description: err?.data?.error || "Change failed", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    changePassword.mutate({ data: { currentPassword, newPassword, confirmPassword } });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <h3 className="font-medium text-foreground">Change Password</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Current Password</Label>
          <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="bg-secondary/50" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">New Password</Label>
          <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-secondary/50" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Confirm New Password</Label>
          <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-secondary/50" required />
        </div>
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={changePassword.isPending}>
          {changePassword.isPending ? "Changing..." : "Change Password"}
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
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account</p>
          </div>
          <div className="flex gap-2">
            <Link href="/notifications">
              <button className="w-9 h-9 bg-card border border-border rounded-xl flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/support">
              <button className="w-9 h-9 bg-card border border-border rounded-xl flex items-center justify-center text-xs font-bold text-primary">
                CS
              </button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="profile" className="flex-1">
              <User className="w-4 h-4 mr-1.5" /> Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> Security
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
          className="w-full mt-4 text-red-400 border-red-400/30 hover:bg-red-400/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </AppLayout>
  );
}
