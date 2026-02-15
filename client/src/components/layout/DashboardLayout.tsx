import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-muted/20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <Sidebar />
      <main className="ml-64 p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
