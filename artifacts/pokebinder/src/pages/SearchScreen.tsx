import { useState, useRef } from "react";
import { Search as SearchIcon, AlertCircle, SearchX, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { searchCardsByName, searchCardsByBroadName, PokemonCard } from "@/api/pokemonApi";
import { CardDetailsModal } from "@/components/cards/CardDetailsModal";
import { useToast } from "@/hooks/use-toast";
import { addOwnedCard, addWantedCard } from "@/storage/collectionStorage";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<PokemonCard[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);
    setLastQuery(query);

    try {
      let cards = await searchCardsByName(query);
      if (cards.length === 0) {
        // Try broader query
        cards = await searchCardsByBroadName(query);
      }
      setResults(cards);
    } catch (err) {
      // Automatic retry with broader query
      try {
        const cards = await searchCardsByBroadName(query);
        setResults(cards);
      } catch (retryErr) {
        setError("Failed to search cards. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleQuickAdd = (e: React.MouseEvent, card: PokemonCard, type: 'owned' | 'wanted') => {
    e.stopPropagation();
    if (type === 'owned') {
      addOwnedCard({
        id: card.id,
        name: card.name,
        imageUrl: card.imageUrl,
        setName: card.setName,
        cardNumber: card.cardNumber,
        rarity: card.rarity
      });
      toast({ title: "Added to Collection!" });
    } else {
      addWantedCard({
        id: card.id,
        name: card.name,
        imageUrl: card.imageUrl,
        setName: card.setName,
        cardNumber: card.cardNumber,
        rarity: card.rarity
      });
      toast({ title: "Added to Wanted List!" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Find Cards</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              ref={inputRef}
              placeholder="Search by Pokémon name (e.g. Pikachu)..." 
              className="pl-10 pr-10 h-14 rounded-xl text-lg font-medium shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <Button type="submit" size="lg" className="h-14 px-8 rounded-xl font-bold shadow-sm" disabled={isSearching || !query.trim()}>
            {isSearching ? "..." : "Search"}
          </Button>
        </form>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {isSearching ? (
        <div className="space-y-4">
          <p className="text-center font-bold text-lg text-primary animate-pulse">Searching for cards...</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[63/88] rounded-xl w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : hasSearched && results.length === 0 && !error ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed flex flex-col items-center">
          <SearchX className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold mb-2">No cards found</h3>
          <p className="text-muted-foreground">No cards found for '{lastQuery}'. Try another Pokémon name or check your spelling.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
          {results.map(card => (
            <div 
              key={card.id} 
              className="group flex flex-col bg-white rounded-xl shadow-sm border p-3 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
              onClick={() => setSelectedCard(card)}
            >
              <div className="aspect-[63/88] rounded-lg overflow-hidden bg-gray-50 mb-3 relative">
                <img 
                  src={card.imageUrl} 
                  alt={card.name} 
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 leading-tight truncate">{card.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 truncate">{card.setName} • #{card.cardNumber}</p>
                <div className="mt-auto flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 h-10 font-bold text-xs btn-touch" 
                    onClick={(e) => handleQuickAdd(e, card, 'owned')}
                  >
                    Have
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 h-10 font-bold text-xs btn-touch"
                    onClick={(e) => handleQuickAdd(e, card, 'wanted')}
                  >
                    Want
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CardDetailsModal 
        card={selectedCard} 
        isOpen={!!selectedCard} 
        onClose={() => setSelectedCard(null)} 
      />
    </div>
  );
}
