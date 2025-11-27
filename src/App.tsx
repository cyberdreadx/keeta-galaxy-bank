import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { KeetaWalletProvider } from "./contexts/KeetaWalletContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <SwipeablePages>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/pay" element={<Pay />} />
      <Route path="/send" element={<Send />} />
      <Route path="/receive" element={<Receive />} />
      <Route path="/bridge" element={<Bridge />} />
      <Route path="/account" element={<Account />} />
      <Route path="/security" element={<Security />} />
      <Route path="/lock" element={<Lock />} />
      <Route path="/address-book" element={<AddressBook />} />
      <Route path="/settings" element={<Settings />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </SwipeablePages>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <KeetaWalletProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </KeetaWalletProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
