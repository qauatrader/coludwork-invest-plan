import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        if (data.user.isAdmin) {
          setLocation("/admin");
        } else {
          setLocation("/");
        }
      },
      onError: (err: any) => {
        toast({
          title: "Access Denied",
          description: err?.data?.error || "Invalid credentials",
          variant: "destructive",
        });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { phone, password } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
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
          <h1 className="text-3xl font-serif font-semibold text-foreground tracking-tight">Private Access</h1>
          <p className="text-muted-foreground/80 text-sm tracking-wide">Enter your credentials to continue</p>
        </div>

        <div className="glass-card rounded-[2rem] p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Phone Number</Label>
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
              <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your private key"
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

            <Button
              type="submit"
              className="w-full h-12 rounded-xl vip-gradient text-background font-bold text-sm tracking-widest uppercase shadow-xl hover:shadow-primary/20 hover:scale-[0.98] transition-all duration-300 border-none"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Authenticating..." : "Authenticate"}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Not a member?{" "}
              <Link href="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                Apply for Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
