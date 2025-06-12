import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

import Landing from "@/pages/landing";
import ImportIQ from "@/pages/importiq";
import ModularDashboard from "@/pages/modular-dashboard";
import Features from "@/pages/features";
import About from "@/pages/about";
import ImportCalculator from "@/pages/import-calculator";
import ImportCalculatorAU from "@/pages/import-calculator-au";
import ImportCalculatorUS from "@/pages/import-calculator-us";
import ImportCalculatorCA from "@/pages/import-calculator-ca";
import ImportCalculatorUK from "@/pages/import-calculator-uk";
import ComplianceEstimate from "@/pages/compliance-estimate";
import ModEstimator from "@/pages/mod-estimator";
import ModCostEstimator from "@/pages/mod-cost-estimator";
import AIRecommendations from "@/pages/ai-recommendations";
import TrueCostExplorer from "@/pages/true-cost-explorer";
import BuildComply from "@/pages/build-comply";
import ImportTimeline from "@/pages/import-timeline";
import ExpertPicks from "@/pages/expert-picks";
import UserDashboard from "@/pages/user-dashboard";
import Dashboard from "@/pages/dashboard";
import EnhancedDashboard from "@/pages/enhanced-dashboard";
import Subscribe from "@/pages/subscribe";
import Pricing from "@/pages/pricing";
import ValueEstimator from "@/pages/value-estimator";
import VehicleLookup from "@/pages/vehicle-lookup";
import { VehicleLookup as VehicleLookupNew } from "@/pages/VehicleLookup";
import { SmartLookupPage } from "@/pages/smart-lookup";
import CustomPlates from "@/pages/custom-plates";
import RegistrationStats from "@/pages/registration-stats";
import PortIntelligence from "@/pages/port-intelligence";
import AuctionSampleExplorer from "@/pages/auction-sample-explorer";
import Checkout from "@/pages/checkout";
import BookingCalendar from "@/pages/booking-calendar";
import AffiliateSignup from "@/pages/affiliate-signup";
import AffiliateDashboard from "@/pages/affiliate-dashboard";
import TrialDashboard from "@/pages/trial-dashboard";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin";
import SecureAdminDashboard from "@/pages/secure-admin";
import AdminLogin from "@/pages/admin-login";
import AdminUserManagement from "@/pages/admin-user-management";
import AdminProfile from "@/pages/admin-profile";
import Contact from "@/pages/contact";
import EnterpriseGeospatial from "@/pages/EnterpriseGeospatial";
import ComplianceChecker from "@/pages/compliance-checker";
import LegalAdvisory from "@/pages/legal-advisory";
import ShippingCalculator from "@/pages/shipping-calculator";
import InsuranceEstimator from "@/pages/insurance-estimator";
import DocumentationAssistant from "@/pages/documentation-assistant";
import ROICalculator from "@/pages/roi-calculator";
import VehicleEligibilityChecker from "@/pages/vehicle-eligibility-checker";
import StateRequirements from "@/pages/state-requirements";
import USMarketIntelligence from "@/pages/us-market-intelligence";
import LiveMarketScanner from "@/pages/live-market-scanner";
import WebhookIntegration from "@/pages/webhook-integration";
import LiveMarketData from "@/pages/live-market-data";
import ImportVolumeDashboard from "@/pages/import-volume-dashboard";
import ImportFlow from "@/pages/import-flow";
import EligibilityCheck from "@/pages/EligibilityCheck";
import ImportJourney from "@/pages/ImportJourney";
import GlobalCompliance from "@/pages/GlobalCompliance";
import ShopLocator from "@/pages/ShopLocator";



import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/importiq" component={ImportIQ} />
      <Route path="/import-calculator" component={ImportCalculator} />
      <Route path="/import-calculator-au" component={ImportCalculatorAU} />
      <Route path="/import-calculator-us" component={ImportCalculatorUS} />
      <Route path="/import-calculator-ca" component={ImportCalculatorCA} />
      <Route path="/import-calculator-uk" component={ImportCalculatorUK} />
      <Route path="/import-cost-calculator" component={ImportCalculator} />
      <Route path="/true-cost-explorer" component={TrueCostExplorer} />
      <Route path="/import-timeline" component={ImportTimeline} />
      <Route path="/build-comply" component={BuildComply} />
      <Route path="/ai-recommendations" component={AIRecommendations} />
      <Route path="/expert-picks" component={ExpertPicks} />
      <Route path="/compliance-estimate" component={ComplianceEstimate} />
      <Route path="/mod-estimator" component={ModEstimator} />
      <Route path="/mod-cost-estimator" component={ModCostEstimator} />
      <Route path="/value-estimator" component={ValueEstimator} />
      <Route path="/vehicle-lookup" component={VehicleLookup} />
      <Route path="/vehicle-intelligence" component={VehicleLookupNew} />
      <Route path="/lookup" component={SmartLookupPage} />
      <Route path="/smart-lookup" component={SmartLookupPage} />
      <Route path="/registration-stats" component={RegistrationStats} />
      <Route path="/import-volume-dashboard" component={PortIntelligence} />
      <Route path="/auction-sample-explorer" component={AuctionSampleExplorer} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/modular-dashboard" component={ModularDashboard} />
      <Route path="/user-dashboard" component={UserDashboard} />
      <Route path="/garage" component={UserDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/secure-admin" component={SecureAdminDashboard} />
      <Route path="/secure-admin-panel-iq2025" component={SecureAdminDashboard} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-users" component={AdminUserManagement} />
      <Route path="/admin-profile" component={AdminProfile} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/booking-calendar" component={BookingCalendar} />
      <Route path="/affiliate-signup" component={AffiliateSignup} />
      <Route path="/affiliate-dashboard" component={AffiliateDashboard} />
      <Route path="/trial-dashboard" component={TrialDashboard} />
      <Route path="/login" component={Login} />
      <Route path="/contact" component={Contact} />
      <Route path="/compliance-checker" component={ComplianceChecker} />
      <Route path="/shipping-calculator" component={ShippingCalculator} />
      <Route path="/market-intelligence" component={ImportVolumeDashboard} />
      <Route path="/auction-intelligence" component={AuctionSampleExplorer} />
      <Route path="/insurance-estimator" component={InsuranceEstimator} />
      <Route path="/legal-advisory" component={LegalAdvisory} />
      <Route path="/buildready" component={BuildComply} />
      <Route path="/registry-lookup" component={CustomPlates} />
      <Route path="/custom-plates" component={CustomPlates} />
      <Route path="/documentation-assistant" component={DocumentationAssistant} />
      <Route path="/roi-calculator" component={ROICalculator} />
      <Route path="/vehicle-eligibility-checker" component={VehicleEligibilityChecker} />
      <Route path="/state-requirements" component={StateRequirements} />
      <Route path="/port-intelligence" component={PortIntelligence} />
      <Route path="/live-market-scanner" component={LiveMarketScanner} />
      <Route path="/webhook-integration" component={WebhookIntegration} />
      <Route path="/import-timeline" component={ImportTimeline} />
      <Route path="/us-market-intelligence" component={USMarketIntelligence} />
      <Route path="/live-market-data" component={LiveMarketData} />

      <Route path="/eligibility-check" component={EligibilityCheck} />
      <Route path="/import-journey" component={ImportJourney} />
      <Route path="/global-compliance" component={GlobalCompliance} />
      <Route path="/shop-locator" component={ShopLocator} />
      <Route path="/mod-shops" component={ShopLocator} />
      <Route path="/find-shops" component={ShopLocator} />
      <Route path="/enterprise-geospatial" component={EnterpriseGeospatial} />
      <Route path="/geospatial-intelligence" component={EnterpriseGeospatial} />
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
