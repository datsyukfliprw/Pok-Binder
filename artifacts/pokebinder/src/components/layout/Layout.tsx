import { TopNav, BottomNav } from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
      <TopNav />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
