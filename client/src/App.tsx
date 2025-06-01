import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import ImportIQ from "@/pages/importiq";
import ImportCalculator from "@/pages/import-calculator";
import ComplianceEstimate from "@/pages/compliance-estimate";
import ModEstimator from "@/pages/mod-estimator";
import AIRecommendations from "@/pages/ai-recommendations";
import TrueCostExplorer from "@/pages/true-cost-explorer";
import BuildComply from "@/pages/build-comply";
import ImportTimeline from "@/pages/import-timeline";
import ExpertPicks from "@/pages/expert-picks";
import Dashboard from "@/pages/dashboard";
import Subscribe from "@/pages/subscribe";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ImportIQ} />
      <Route path="/import-calculator" component={ImportCalculator} />
      <Route path="/true-cost-explorer" component={TrueCostExplorer} />
      <Route path="/import-timeline" component={ImportTimeline} />
      <Route path="/build-comply" component={BuildComply} />
      <Route path="/ai-recommendations" component={AIRecommendations} />
      <Route path="/expert-picks" component={ExpertPicks} />
      <Route path="/compliance-estimate" component={ComplianceEstimate} />
      <Route path="/mod-estimator" component={ModEstimator} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/subscribe" component={Subscribe} />
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
