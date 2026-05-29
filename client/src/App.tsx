import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Maintenance from "./pages/Maintenance";
import ManageMachines from "./pages/ManageMachines";
import MachineDetail from "./pages/MachineDetail";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import AppLayout from "./components/AppLayout";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/manutencao" component={Maintenance} />
        <Route path="/gerenciar" component={ManageMachines} />
        <Route path="/perfil" component={Profile} />
        <Route path="/maquina/:id" component={MachineDetail} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
