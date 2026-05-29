import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, BookOpen, Star, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOwnedCards, getWantedCards, OwnedCard } from "@/storage/collectionStorage";

export default function HomeScreen() {
  const [stats, setStats] = useState({ owned: 0, wanted: 0, unique: 0 });
  const [recentCards, setRecentCards] = useState<OwnedCard[]>([]);

  useEffect(() => {
    const loadData = () => {
      const owned = getOwnedCards();
      const wanted = getWantedCards();
      
      const totalOwned = owned.reduce((sum, card) => sum + card.quantity, 0);
      const uniqueOwned = owned.length;
      
      setStats({
        owned: totalOwned,
        wanted: wanted.length,
        unique: uniqueOwned
      });
      
      // Sort by date added descending
      const sorted = [...owned].sort((a, b) => 
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      );
      setRecentCards(sorted.slice(0, 4));
    };

    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary drop-shadow-sm flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-sm overflow-hidden relative">
             <div className="w-full h-1/2 bg-destructive rounded-t-full absolute top-0" />
             <div className="w-full h-[2px] bg-gray-900 absolute" />
             <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-900 absolute z-10" />
          </div>
          PokéBinder
        </h1>
        <p className="text-muted-foreground font-medium text-lg">Your personal card collection</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md border-0">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <p className="text-sm font-semibold opacity-90 uppercase tracking-wider mb-1">Total</p>
            <p className="text-3xl font-black">{stats.owned}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 shadow-md border-0">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <p className="text-sm font-semibold opacity-90 uppercase tracking-wider mb-1">Unique</p>
            <p className="text-3xl font-black">{stats.unique}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-md border-0">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <p className="text-sm font-semibold opacity-90 uppercase tracking-wider mb-1">Wanted</p>
            <p className="text-3xl font-black">{stats.wanted}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/search">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all">
            <Search className="w-8 h-8 text-primary" />
            <span className="font-bold text-base">Search Cards</span>
          </Button>
        </Link>
        <Link href="/collection">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="font-bold text-base">My Collection</span>
          </Button>
        </Link>
        <Link href="/wanted">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all">
            <Star className="w-8 h-8 text-amber-500" />
            <span className="font-bold text-base">Wanted List</span>
          </Button>
        </Link>
        <Link href="/scan">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all">
            <Camera className="w-8 h-8 text-emerald-500" />
            <span className="font-bold text-base">Scan Card</span>
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <SparklesIcon /> Recently Added
        </h2>
        
        {recentCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentCards.map(card => (
              <div key={card.id} className="relative group">
                <div className="aspect-[63/88] rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50">
                  <img 
                    src={card.imageUrl} 
                    alt={card.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                  x{card.quantity}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-medium">No cards yet!</p>
              <p className="text-sm mt-1 mb-4">Start your collection by searching or scanning cards.</p>
              <Link href="/search">
                <Button>Find Cards</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-amber-500"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
