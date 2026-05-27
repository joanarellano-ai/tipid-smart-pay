import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Splash from "./pages/Splash";
import Welcome from "./pages/Welcome";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Utilities from "./pages/Utilities";
import WalletPage from "./pages/WalletPage";
import PaymentMethods from "./pages/PaymentMethods";
import Reminders from "./pages/Reminders";
import SharedBills from "./pages/SharedBills";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import BillHistory from "./pages/BillHistory";
import BillSurvey from "./pages/BillSurvey";
import SplitBills from "./pages/SplitBills";
import VacationDashboard from "./pages/VacationDashboard";
import Premium from "./pages/Premium";
import AppShell from "./components/AppShell";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/explore" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/bill-survey" element={<BillSurvey />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/utilities" element={<Utilities />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/payment-methods" element={<PaymentMethods />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/bills" element={<SharedBills />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bill-history" element={<BillHistory />} />
            <Route path="/splits" element={<SplitBills />} />
            <Route path="/trips" element={<VacationDashboard />} />
            <Route path="/premium" element={<Premium />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
