import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { KeetaWalletProvider } from "./contexts/KeetaWalletContext";
import { BaseWalletProvider } from "./contexts/BaseWalletContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { SwipeablePages } from "./components/SwipeablePages";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Eager load critical pages
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Lock from "./pages/Lock";

// Lazy load all other pages
const Send = lazy(() => import("./pages/Send"));
const Receive = lazy(() => import("./pages/Receive"));
const Pay = lazy(() => import("./pages/Pay"));
const Bridge = lazy(() => import("./pages/Bridge"));
const Account = lazy(() => import("./pages/Account"));
const Security = lazy(() => import("./pages/Security"));
const AddressBook = lazy(() => import("./pages/AddressBook"));
const Settings = lazy(() => import("./pages/Settings"));
const Install = lazy(() => import("./pages/Install"));
const NFTGallery = lazy(() => import("./pages/NFTGallery"));
const DAppBrowser = lazy(() => import("./pages/DAppBrowser"));
const Swap = lazy(() => import("./pages/Swap"));
const Buy = lazy(() => import("./pages/Buy"));
const Connect = lazy(() => import("./pages/Connect"));
const ConnectedSites = lazy(() => import("./pages/ConnectedSites"));
const ConfirmTransaction = lazy(() => import("./pages/ConfirmTransaction"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-full">
    <Loader2 className="w-8 h-8 text-sw-blue animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const AppRoutes = () => (
  <SwipeablePages>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/pay" element={<Pay />} />
        <Route path="/buy" element={<Buy />} />
        <Route path="/send" element={<Send />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/bridge" element={<Bridge />} />
        <Route path="/account" element={<Account />} />
        <Route path="/security" element={<Security />} />
        <Route path="/lock" element={<Lock />} />
        <Route path="/address-book" element={<AddressBook />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/install" element={<Install />} />
        <Route path="/nfts" element={<NFTGallery />} />
        <Route path="/browser" element={<DAppBrowser />} />
        <Route path="/swap" element={<Swap />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/connected-sites" element={<ConnectedSites />} />
              <Route path="/confirm-tx" element={<ConfirmTransaction />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </SwipeablePages>
);

const App = () => {
  console.log("App mounting...");
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <KeetaWalletProvider>
          <BaseWalletProvider>
            <Toaster />
            <Sonner />
            <HashRouter>
              <AppRoutes />
            </HashRouter>
          </BaseWalletProvider>
        </KeetaWalletProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
