import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { KeetaWalletProvider } from "./contexts/KeetaWalletContext";
import { BaseWalletProvider } from "./contexts/BaseWalletContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { SwipeablePages } from "./components/SwipeablePages";
import Index from "./pages/Index";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import Pay from "./pages/Pay";
import Bridge from "./pages/Bridge";
import Account from "./pages/Account";
import Security from "./pages/Security";
import Lock from "./pages/Lock";
import AddressBook from "./pages/AddressBook";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import Install from "./pages/Install";
import NFTGallery from "./pages/NFTGallery";
import DAppBrowser from "./pages/DAppBrowser";
import Swap from "./pages/Swap";
import Buy from "./pages/Buy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <SwipeablePages>
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
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </BaseWalletProvider>
        </KeetaWalletProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
