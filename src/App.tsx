import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { KeetaWalletProvider } from "./contexts/KeetaWalletContext";
import Index from "./pages/Index";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import KeetaPay from "./pages/KeetaPay";
import Account from "./pages/Account";
import Security from "./pages/Security";
import Lock from "./pages/Lock";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <KeetaWalletProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/keetapay" element={<KeetaPay />} />
            <Route path="/send" element={<Send />} />
            <Route path="/receive" element={<Receive />} />
            <Route path="/account" element={<Account />} />
            <Route path="/security" element={<Security />} />
            <Route path="/lock" element={<Lock />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </KeetaWalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
