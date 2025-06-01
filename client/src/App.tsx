import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import ImportIQ from "@/pages/importiq";
import Features from "@/pages/features";
import About from "@/pages/about";
import ImportCalculator from "@/pages/import-calculator";
import ComplianceEstimate from "@/pages/compliance-estimate";
import ModEstimator from "@/pages/mod-estimator";
import AIRecommendations from "@/pages/ai-recommendations";
import TrueCostExplorer from "@/pages/true-cost-explorer";
import BuildComply from "@/pages/build-comply";
import ImportTimeline from "@/pages/import-timeline";
import ExpertPicks from "@/pages/expert-picks";
import Dashboard from "@/pages/dashboard";
import UserDashboard from "@/pages/user-dashboard";
import EnhancedDashboard from "@/pages/enhanced-dashboard";
import Subscribe from "@/pages/subscribe";
import ValueEstimator from "@/pages/value-estimator";
import VehicleLookup from "@/pages/vehicle-lookup";
import RegistrationStats from "@/pages/registration-stats";
import ImportVolumeDashboard from "@/pages/import-volume-dashboard";
import AuctionSampleExplorer from "@/pages/auction-sample-explorer";
import Checkout from "@/pages/checkout";
import BookingCalendar from "@/pages/booking-calendar";
import AffiliateSignup from "@/pages/affiliate-signup";
import AffiliateDashboard from "@/pages/affiliate-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ImportIQ} />
      <Route path="/features" component={Features} />
      <Route path="/about" component={About} />
      <Route path="/import-calculator" component={ImportCalculator} />
      <Route path="/true-cost-explorer" component={TrueCostExplorer} />
      <Route path="/import-timeline" component={ImportTimeline} />
      <Route path="/build-comply" component={BuildComply} />
      <Route path="/ai-recommendations" component={AIRecommendations} />
      <Route path="/expert-picks" component={ExpertPicks} />
      <Route path="/compliance-estimate" component={ComplianceEstimate} />
      <Route path="/mod-estimator" component={ModEstimator} />
      <Route path="/value-estimator" component={ValueEstimator} />
      <Route path="/vehicle-lookup" component={VehicleLookup} />
      <Route path="/registration-stats" component={RegistrationStats} />
      <Route path="/import-volume-dashboard" component={ImportVolumeDashboard} />
      <Route path="/auction-sample-explorer" component={AuctionSampleExplorer} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/user-dashboard" component={UserDashboard} />
      <Route path="/admin" component={Dashboard} />
      <Route path="/garage" component={EnhancedDashboard} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/booking" component={BookingCalendar} />
      <Route path="/affiliate-signup" component={AffiliateSignup} />
      <Route path="/affiliate-dashboard" component={AffiliateDashboard} />
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
