import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth";
import Onboarding from "@/pages/onboarding";
import DashboardOverview from "@/pages/dashboard/overview";
import DashboardMenus from "@/pages/dashboard/menus";
import DashboardQR from "@/pages/dashboard/qr";
import PublicMenu from "@/pages/public-menu";
import DemoPage from "@/pages/demo";
import DiscoverPage from "@/pages/discover";

import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect logic handled inside component or router if needed, 
    // but typically we'd redirect to /login here
    window.location.href = "/login";
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      
      {/* Auth */}
      <Route path="/login"><AuthPage mode="login" /></Route>
      <Route path="/register"><AuthPage mode="register" /></Route>
      
      {/* Onboarding */}
      <Route path="/onboarding">
        <ProtectedRoute component={Onboarding} />
      </Route>

      {/* Dashboard */}
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardOverview} />
      </Route>
      <Route path="/dashboard/menus">
        <ProtectedRoute component={DashboardMenus} />
      </Route>
      <Route path="/dashboard/qr">
        <ProtectedRoute component={DashboardQR} />
      </Route>

      {/* Public Menu */}
      <Route path="/menu/:slug" component={PublicMenu} />

      {/* Discover Dubai */}
      <Route path="/discover" component={DiscoverPage} />

      {/* Interactive Demo */}
      <Route path="/demo" component={DemoPage} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
