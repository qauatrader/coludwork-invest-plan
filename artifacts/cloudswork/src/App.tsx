import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { setupApiClient } from "@/lib/api-setup";
import NotFound from "@/pages/not-found";

import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import DashboardPage from "@/pages/dashboard";
import PlansPage from "@/pages/plans";
import WalletPage from "@/pages/wallet";
import ReferralPage from "@/pages/referral";
import TasksPage from "@/pages/tasks";
import ProfilePage from "@/pages/profile";
import NotificationsPage from "@/pages/notifications";
import SupportPage from "@/pages/support";

import AdminDashboard from "@/pages/admin/index";
import AdminUsers from "@/pages/admin/users";
import AdminDeposits from "@/pages/admin/deposits";
import AdminWithdrawals from "@/pages/admin/withdrawals";
import AdminPlans from "@/pages/admin/plans";
import AdminPaymentMethods from "@/pages/admin/payment-methods";
import AdminTasks from "@/pages/admin/tasks";
import AdminSettings from "@/pages/admin/settings";
import AdminSupport from "@/pages/admin/support";

setupApiClient();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) return null;

  if (!token) {
    return <Redirect to={`/login`} />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!token) return <Redirect to="/login" />;
  if (user && !user.isAdmin) return <Redirect to="/" />;

  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  if (token) {
    return <Redirect to={user?.isAdmin ? "/admin" : "/"} />;
  }
  return <>{children}</>;
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
  );
}

export default App;
