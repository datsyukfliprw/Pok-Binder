import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, Star, ArrowRight, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getWantedCards, moveWantedToOwned, removeWantedCard, WantedCard } from "@/storage/collectionStorage";
import { useToast } from "@/hooks/use-toast";

export default function WantedScreen() {
  const [cards, setCards] = useState<WantedCard[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = () => {
    setCards(getWantedCards());
  };

  const handleMoveToOwned = (id: string, name: string) => {
    moveWantedToOwned(id);
    toast({
      title: "Moved to Collection!",
      description: `You finally got ${name}!`,
    });
    loadCards();
  };

  const handleRemove = (id: string) => {
    removeWantedCard(id);
    loadCards();
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Star className="w-8 h-8 text-amber-500 fill-amber-500" /> Wanted
        </h1>
        <Badge variant="secondary" className="text-base px-3 py-1 font-bold">
          {cards.length} Cards
        </Badge>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-20 bg-amber-50 rounded-3xl shadow-sm border border-amber-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Star className="w-12 h-12 text-amber-300" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No wanted cards yet!</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Keep track of the cards you're hunting for.
          </p>
          <Link href="/search">
            <Button size="lg" className="rounded-full px-8 font-bold h-14 bg-amber-500 hover:bg-amber-600 text-white btn-touch">
              <Search className="w-5 h-5 mr-2" /> Find Cards to Wish For
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
          {cards.map(card => (
            <div key={card.id} className="bg-white rounded-xl shadow-sm border border-amber-100 p-3 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-200 to-transparent opacity-50 z-0" />
              
              <div className="relative aspect-[63/88] rounded-lg overflow-hidden bg-gray-50 mb-3 z-10">
                <img 
                  src={card.imageUrl} 
                  alt={card.name} 
                  className="w-full h-full object-contain grayscale-[0.2]"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 flex flex-col z-10">
                <h3 className="font-bold text-gray-900 leading-tight truncate">{card.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 truncate">{card.setName}</p>

                <div className="mt-auto flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    className="w-full h-10 font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white btn-touch"
                    onClick={() => handleMoveToOwned(card.id, card.name)}
                  >
                    Got it! <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                  
                  {confirmDeleteId === card.id ? (
                    <div className="flex gap-1 h-10 animate-in fade-in">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1 font-bold text-xs btn-touch"
                        onClick={() => handleRemove(card.id)}
                      >
                        <Check className="w-3 h-3 mr-1" /> Yes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 font-bold text-xs btn-touch"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        <X className="w-3 h-3 mr-1" /> No
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-full h-10 text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50 btn-touch"
                      onClick={() => setConfirmDeleteId(card.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
