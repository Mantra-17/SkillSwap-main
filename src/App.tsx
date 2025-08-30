import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BrowseSkillsPage from "./pages/BrowseSkillsPage";
import ProfilePage from "./pages/ProfilePage";
import RequestsPage from "./pages/RequestsPage";
import AdminPage from "./pages/AdminPage";
import SignInPage from "./pages/SignInPage";
import NotFound from "./pages/NotFound";
import FindSkillsPage from "./pages/FindSkillsPage";
import RequestSwapsPage from "./pages/RequestSwapsPage";
import RateReviewPage from "./pages/RateReviewPage";
import SecurePlatformPage from "./pages/SecurePlatformPage";
import StaticDemo from "./pages/StaticDemo";
import TestSupabase from "./pages/TestSupabase";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowseSkillsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/find-skills" element={<FindSkillsPage />} />
          <Route path="/request-swaps" element={<RequestSwapsPage />} />
          <Route path="/rate-review" element={<RateReviewPage />} />
          <Route path="/secure-platform" element={<SecurePlatformPage />} />
          <Route path="/static-demo" element={<StaticDemo />} />
          <Route path="/test-supabase" element={<TestSupabase />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
