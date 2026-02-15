import { Link, useLocation } from "wouter";
import { Camera, Image as ImageIcon, FileText, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { href: "/galleries", label: "Galleries", icon: ImageIcon },
    { href: "/invoices", label: "Invoices", icon: FileText },
  ];

  return (
    <div className="h-screen w-64 bg-background border-r flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg leading-tight">Lumina</h1>
            <p className="text-xs text-muted-foreground">Portfolio Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                location === item.href
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t bg-muted/20">
        <div className="mb-4 px-4">
          <p className="text-sm font-medium">{user?.businessName || "Photographer"}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
