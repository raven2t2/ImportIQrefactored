import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ImportCalculator from "@/pages/import-calculator";
import JapanValue from "@/pages/japan-value";
import ComplianceEstimate from "@/pages/compliance-estimate";
import ModEstimator from "@/pages/mod-estimator";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ImportCalculator} />
      <Route path="/japan-value" component={JapanValue} />
      <Route path="/compliance-estimate" component={ComplianceEstimate} />
      <Route path="/mod-estimator" component={ModEstimator} />
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
