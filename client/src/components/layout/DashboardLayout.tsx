import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
    <div className="min-h-screen bg-muted/10 dark:bg-neutral-900">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 z-40 px-4 py-3 flex items-center justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h1 className="font-display font-bold text-lg">Lumina</h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Main Content - responsive margin */}
      <main className={`
        lg:ml-64 
        p-4 sm:p-6 lg:p-8 
        max-w-7xl mx-auto
        mt-14 lg:mt-0
      `}>
        {children}
      </main>
      
      <ThemeToggle />
    </div>
  );
}
