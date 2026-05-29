import { Link, useLocation } from "wouter";
import { Home, Search, BookOpen, Star, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/search", label: "Search", icon: Search },
  { path: "/collection", label: "Collection", icon: BookOpen },
  { path: "/wanted", label: "Wanted", icon: Star },
  { path: "/scan", label: "Scan", icon: Camera },
];

export function TopNav() {
  const [location] = useLocation();

  return (
    <nav className="hidden md:flex sticky top-0 z-50 w-full border-b bg-primary shadow-sm text-primary-foreground">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 mr-6 text-xl font-bold font-sans">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
             <div className="w-full h-1/2 bg-destructive rounded-t-full absolute top-0" />
             <div className="w-full h-[2px] bg-gray-900 absolute" />
             <div className="w-2 h-2 rounded-full bg-white border border-gray-900 absolute z-10" />
          </div>
          PokéBinder
        </Link>
        <div className="flex gap-1 ml-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-colors font-semibold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/80"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive ? "fill-primary/20" : "")} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
