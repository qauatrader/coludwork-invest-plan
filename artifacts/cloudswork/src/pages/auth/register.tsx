import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Phone, User, KeyRound } from "lucide-react";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [prefilledRef, setPrefilledRef] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref);
      setPrefilledRef(true);
    }
  }, []);

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        setLocation("/");
      },
      onError: (err: any) => {
        toast({
          title: "Application Denied",
          description: err?.data?.error || "Could not create account",
          variant: "destructive",
        });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Keys do not match",
        description: "Please make sure both private keys are the same",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate({
      data: {
        phone,
        nickname,
        password,
        confirmPassword,
        ...(referralCode ? { referralCode } : {}),
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden py-12">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-sm space-y-10 relative z-10 animate-stagger-1">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full vip-gradient flex items-center justify-center p-[2px] shadow-2xl">
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center font-serif font-bold text-3xl text-primary">
                CW
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-serif font-semibold text-foreground tracking-tight">Membership</h1>
          <p className="text-muted-foreground/80 text-sm tracking-wide">Apply for private access</p>
        </div>

        <div className="glass-card rounded-[2rem] p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  className="bg-background/50 border-white/10 pl-11 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Alias</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  id="nickname"
                  placeholder="Your display name"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  required
                  className="bg-background/50 border-white/10 pl-11 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Private Key</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong key"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="bg-background/50 border-white/10 pl-11 pr-11 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Verify Key</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your key"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="bg-background/50 border-white/10 pl-11 pr-11 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referral" className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Invitation Code</Label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  id="referral"
                  placeholder="Optional"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value)}
                  readOnly={!!prefilledRef}
                  className={`bg-background/50 border-white/10 pl-11 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all font-medium ${prefilledRef ? "text-primary border-primary/30" : ""}`}
                />
              </div>
              {prefilledRef && (
                <p className="text-[10px] text-primary tracking-wide">Invitation code verified</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 mt-2 rounded-xl vip-gradient text-background font-bold text-sm tracking-widest uppercase shadow-xl hover:shadow-primary/20 hover:scale-[0.98] transition-all duration-300 border-none"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Processing..." : "Submit Application"}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Already a member?{" "}
              <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                Authenticate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
