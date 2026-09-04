import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider } from "@/state/AppState";
import { ThemeProvider } from "@/state/ThemeProvider";
import Index from "./pages/Index.tsx";
import ComingSoon from "./pages/ComingSoon.tsx";
import Coffee from "./pages/Coffee.tsx";
import Login from "./pages/Login.tsx";
import Checkout from "./pages/Checkout.tsx";
import QrMenu from "./pages/QrMenu.tsx";
import Club from "./pages/Club.tsx";
import ClubEvent from "./pages/ClubEvent.tsx";
import Rent from "./pages/Rent.tsx";
import About from "./pages/About.tsx";
import Cowork from "./pages/Cowork.tsx";
import Police from "./pages/Police.tsx";
import Review from "./pages/Review.tsx";
import NotFound from "./pages/NotFound.tsx";

import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import PlansPage from "./pages/app/PlansPage";
import AccessPage from "./pages/app/AccessPage";
import SeatsPage from "./pages/app/SeatsPage";
import CafePage from "./pages/app/CafePage";
import EventsPage from "./pages/app/EventsPage";
import ProfilePage from "./pages/app/ProfilePage";
import OrderStatusPage from "./pages/app/OrderStatusPage";
import ClubPage from "./pages/app/ClubPage";
import PassesPage from "./pages/app/PassesPage";
import Auth from "./pages/Auth";
import OAuthConsent from "./pages/OAuthConsent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
       <AppStateProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/soon" element={<ComingSoon />} />
            <Route path="/preview" element={<Index />} />
            <Route path="/coffee" element={<Coffee />} />
            <Route path="/login" element={<Login />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/qr-menu" element={<QrMenu />} />
            <Route path="/club" element={<Club />} />
            <Route path="/club/event/:slug" element={<ClubEvent />} />
            <Route path="/rent" element={<Rent />} />

            <Route path="/about" element={<About />} />
            <Route path="/cowork" element={<Cowork />} />
            <Route path="/police" element={<Police />} />
            <Route path="/review" element={<Review />} />

            <Route path="/auth" element={<Auth />} />

            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="access" element={<AccessPage />} />
              <Route path="seats" element={<SeatsPage />} />
              <Route path="cafe" element={<CafePage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders/:id" element={<OrderStatusPage />} />
              <Route path="club" element={<ClubPage />} />
              <Route path="passes" element={<PassesPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
       </AppStateProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
