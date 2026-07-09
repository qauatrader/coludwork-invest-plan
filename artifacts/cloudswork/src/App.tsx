import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { setupApiClient } from "@/lib/api-setup";
import NotFound from "@/pages/not-found";
import { Suspense, lazy, Component, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

setupApiClient();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load pages for better initial load performance
const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const PlansPage = lazy(() => import("@/pages/plans"));
const WalletPage = lazy(() => import("@/pages/wallet"));
const ReferralPage = lazy(() => import("@/pages/referral"));
const TasksPage = lazy(() => import("@/pages/tasks"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const NotificationsPage = lazy(() => import("@/pages/notifications"));
const SupportPage = lazy(() => import("@/pages/support"));
const AdminDashboard = lazy(() => import("@/pages/admin/index"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminDeposits = lazy(() => import("@/pages/admin/deposits"));
const AdminWithdrawals = lazy(() => import("@/pages/admin/withdrawals"));
const AdminPlans = lazy(() => import("@/pages/admin/plans"));
const AdminPaymentMethods = lazy(() => import("@/pages/admin/payment-methods"));
const AdminTasks = lazy(() => import("@/pages/admin/tasks"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));
const AdminSupport = lazy(() => import("@/pages/admin/support"));

function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center", className)}>
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">Loading CloudsWork...</p>
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) return <AuthLoadingScreen />;

  if (!token) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, user, isLoading } = useAuth();

  if (isLoading) return <AuthLoadingScreen />;

  if (!token) return <Redirect to="/login" />;
  if (!user?.isAdmin) return <Redirect to="/" />;

  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { token, user, isLoading } = useAuth();
  if (isLoading) return <AuthLoadingScreen />;
  if (token) {
    return <Redirect to={user?.isAdmin ? "/admin" : "/"} />;
  }
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <GuestRoute><LoginPage /></GuestRoute>
      </Route>
      <Route path="/register">
        <GuestRoute><RegisterPage /></GuestRoute>
      </Route>

      <Route path="/">
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      </Route>
      <Route path="/plans">
        <ProtectedRoute><PlansPage /></ProtectedRoute>
      </Route>
      <Route path="/wallet">
        <ProtectedRoute><WalletPage /></ProtectedRoute>
      </Route>
      <Route path="/referral">
        <ProtectedRoute><ReferralPage /></ProtectedRoute>
      </Route>
      <Route path="/tasks">
        <ProtectedRoute><TasksPage /></ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      </Route>
      <Route path="/notifications">
        <ProtectedRoute><NotificationsPage /></ProtectedRoute>
      </Route>
      <Route path="/support">
        <ProtectedRoute><SupportPage /></ProtectedRoute>
      </Route>

      <Route path="/admin">
        <AdminRoute><AdminDashboard /></AdminRoute>
      </Route>
      <Route path="/admin/users">
        <AdminRoute><AdminUsers /></AdminRoute>
      </Route>
      <Route path="/admin/deposits">
        <AdminRoute><AdminDeposits /></AdminRoute>
      </Route>
      <Route path="/admin/withdrawals">
        <AdminRoute><AdminWithdrawals /></AdminRoute>
      </Route>
      <Route path="/admin/plans">
        <AdminRoute><AdminPlans /></AdminRoute>
      </Route>
      <Route path="/admin/payment-methods">
        <AdminRoute><AdminPaymentMethods /></AdminRoute>
      </Route>
      <Route path="/admin/tasks">
        <AdminRoute><AdminTasks /></AdminRoute>
      </Route>
      <Route path="/admin/support">
        <AdminRoute><AdminSupport /></AdminRoute>
      </Route>
      <Route path="/admin/settings">
        <AdminRoute><AdminSettings /></AdminRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
