import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import HomeScreen from "@/pages/HomeScreen";
import SearchScreen from "@/pages/SearchScreen";
import CollectionScreen from "@/pages/CollectionScreen";
import WantedScreen from "@/pages/WantedScreen";
import ScanScreen from "@/pages/ScanScreen";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeScreen} />
      <Route path="/search" component={SearchScreen} />
      <Route path="/collection" component={CollectionScreen} />
      <Route path="/wanted" component={WantedScreen} />
      <Route path="/scan" component={ScanScreen} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
