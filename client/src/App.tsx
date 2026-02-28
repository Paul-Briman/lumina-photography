import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ResetPassword from "@/pages/auth/ResetPassword";
import GalleryList from "@/pages/galleries/GalleryList";
import GalleryDetail from "@/pages/galleries/GalleryDetail";
import CreateInvoice from "@/pages/invoices/CreateInvoice";
import NotFound from "@/pages/not-found";
import ClientGallery from "@/pages/ClientGallery";
import TermsOfService from "@/pages/legal/TermsOfService";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/share/:token" component={ClientGallery} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />

      {/* Protected Routes */}
      <Route path="/galleries" component={GalleryList} />
      <Route path="/galleries/:id" component={GalleryDetail} />
      <Route path="/invoices" component={CreateInvoice} />
      <Route path="/invoices/new" component={CreateInvoice} />

      {/* Redirect root to galleries (which will redirect to login if needed) */}
      <Route path="/">
        <Redirect to="/galleries" />
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
