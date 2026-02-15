import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import GalleryList from "@/pages/galleries/GalleryList";
import GalleryDetail from "@/pages/galleries/GalleryDetail";
import InvoiceList from "@/pages/invoices/InvoiceList";
import SharedGallery from "@/pages/public/SharedGallery";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/share/:token" component={SharedGallery} />
      
      {/* Protected Routes */}
      <Route path="/galleries" component={GalleryList} />
      <Route path="/galleries/:id" component={GalleryDetail} />
      <Route path="/invoices" component={InvoiceList} />
      
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
