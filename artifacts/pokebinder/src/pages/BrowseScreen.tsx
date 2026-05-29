import { useState, useRef, useEffect, useMemo } from "react";
import { Search as SearchIcon, AlertCircle, SearchX, X, LibraryBig, Library, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { searchCardsByName, searchCardsByBroadName, getSets, getCardsBySet, PokemonCard, PokemonSet } from "@/api/pokemonApi";
import { CardDetailsModal } from "@/components/cards/CardDetailsModal";
import { CardGridItem } from "@/components/cards/CardGridItem";
import { useToast } from "@/hooks/use-toast";
import { addOwnedCard, addWantedCard, getOwnedCards, getWantedCards } from "@/storage/collectionStorage";

export default function BrowseScreen() {
  const [activeTab, setActiveTab] = useState<'search' | 'sets'>('search');

  // Common Card Interaction state
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [wantedIds, setWantedIds] = useState<Set<string>>(new Set());

  const { toast } = useToast();

  const loadCollectionState = () => {
    const owned = getOwnedCards();
    const wanted = getWantedCards();
    setOwnedIds(new Set(owned.map(c => c.id)));
    setWantedIds(new Set(wanted.map(c => c.id)));
  };

  useEffect(() => {
    loadCollectionState();
    window.addEventListener('storage-update', loadCollectionState);
    return () => window.removeEventListener('storage-update', loadCollectionState);
  }, []);

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
      toast({ title: "Added to collection!" });
    } else {
      addWantedCard({
        id: card.id,
        name: card.name,
        imageUrl: card.imageUrl,
        setName: card.setName,
        cardNumber: card.cardNumber,
        rarity: card.rarity
      });
      toast({ title: "Added to wish list!" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">TCG Database</h1>
      
      <div className="flex bg-gray-100 p-1 rounded-full w-full">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full font-bold text-sm transition-all ${
            activeTab === 'search' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-gray-900'
          }`}
          data-testid="tab-search"
        >
          <SearchIcon className="w-4 h-4" />
          Search Cards
        </button>
        <button
          onClick={() => setActiveTab('sets')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full font-bold text-sm transition-all ${
            activeTab === 'sets' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-gray-900'
          }`}
          data-testid="tab-sets"
        >
          <LibraryBig className="w-4 h-4" />
          Browse Sets
        </button>
      </div>

      {activeTab === 'search' ? (
        <SearchTab 
          ownedIds={ownedIds} 
          wantedIds={wantedIds}
          onAddOwned={(e, c) => handleQuickAdd(e, c, 'owned')}
          onAddWanted={(e, c) => handleQuickAdd(e, c, 'wanted')}
          onSelectCard={setSelectedCard}
        />
      ) : (
        <SetsTab 
          ownedIds={ownedIds} 
          wantedIds={wantedIds}
          onAddOwned={(e, c) => handleQuickAdd(e, c, 'owned')}
          onAddWanted={(e, c) => handleQuickAdd(e, c, 'wanted')}
          onSelectCard={setSelectedCard}
        />
      )}

      <CardDetailsModal 
        card={selectedCard} 
        isOpen={!!selectedCard} 
        onClose={() => setSelectedCard(null)} 
      />
    </div>
  );
}

// --- Search Tab ---

function SearchTab({ 
  ownedIds, 
  wantedIds, 
  onAddOwned, 
  onAddWanted, 
  onSelectCard 
}: { 
  ownedIds: Set<string>;
  wantedIds: Set<string>;
  onAddOwned: (e: React.MouseEvent, c: PokemonCard) => void;
  onAddWanted: (e: React.MouseEvent, c: PokemonCard) => void;
  onSelectCard: (c: PokemonCard) => void;
}) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<PokemonCard[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  
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
        cards = await searchCardsByBroadName(query);
      }
      setResults(cards);
    } catch (err) {
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

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            ref={inputRef}
            placeholder="Search by Pokémon name..." 
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

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {isSearching ? (
        <div className="space-y-4">
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
          <p className="text-muted-foreground">No cards found for '{lastQuery}'. Try a different name.</p>
        </div>
      ) : hasSearched ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
          {results.map(card => (
            <CardGridItem 
              key={card.id} 
              card={card} 
              isOwned={ownedIds.has(card.id)}
              isWanted={wantedIds.has(card.id)}
              onSelect={onSelectCard}
              onAddOwned={onAddOwned}
              onAddWanted={onAddWanted}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Search for any Pokémon card name above</p>
        </div>
      )}
    </div>
  );
}

// --- Sets Tab ---

function SetsTab({ 
  ownedIds, 
  wantedIds, 
  onAddOwned, 
  onAddWanted, 
  onSelectCard 
}: { 
  ownedIds: Set<string>;
  wantedIds: Set<string>;
  onAddOwned: (e: React.MouseEvent, c: PokemonCard) => void;
  onAddWanted: (e: React.MouseEvent, c: PokemonCard) => void;
  onSelectCard: (c: PokemonCard) => void;
}) {
  const [sets, setSets] = useState<PokemonSet[]>([]);
  const [isLoadingSets, setIsLoadingSets] = useState(true);
  const [errorSets, setErrorSets] = useState<string | null>(null);
  const [setFilter, setSetFilter] = useState("");
  const [hasFetchedSets, setHasFetchedSets] = useState(false);

  const [activeSet, setActiveSet] = useState<PokemonSet | null>(null);
  const [setCards, setSetCards] = useState<PokemonCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [errorCards, setErrorCards] = useState<string | null>(null);

  useEffect(() => {
    if (hasFetchedSets) return;
    setHasFetchedSets(true);
    
    async function fetchSets() {
      try {
        const data = await getSets();
        setSets(data);
      } catch (err) {
        setErrorSets("Failed to load sets.");
      } finally {
        setIsLoadingSets(false);
      }
    }
    fetchSets();
  }, [hasFetchedSets]);

  const filteredSets = useMemo(() => {
    if (!setFilter.trim()) return sets;
    const lower = setFilter.toLowerCase();
    return sets.filter(s => s.name.toLowerCase().includes(lower) || s.series.toLowerCase().includes(lower));
  }, [sets, setFilter]);

  const setsBySeries = useMemo(() => {
    const groups: Record<string, PokemonSet[]> = {};
    filteredSets.forEach(s => {
      if (!groups[s.series]) groups[s.series] = [];
      groups[s.series].push(s);
    });
    // The API already ordered by -releaseDate, so within groups it's ordered
    // We also want to order the groups by the newest set in that series
    const sortedGroups = Object.entries(groups).map(([series, items]) => ({
      series,
      items,
      newestDate: items[0]?.releaseDate || ""
    })).sort((a, b) => b.newestDate.localeCompare(a.newestDate));
    return sortedGroups;
  }, [filteredSets]);

  const loadSetCards = async (set: PokemonSet) => {
    setActiveSet(set);
    setIsLoadingCards(true);
    setErrorCards(null);
    setSetCards([]);
    
    try {
      const cards = await getCardsBySet(set.id);
      setSetCards(cards);
    } catch (err) {
      setErrorCards("Failed to load cards for this set.");
    } finally {
      setIsLoadingCards(false);
    }
  };

  if (activeSet) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setActiveSet(null)} className="pl-0 hover:bg-transparent text-muted-foreground hover:text-gray-900">
          <ChevronLeft className="w-5 h-5 mr-1" /> All Sets
        </Button>
        
        <div className="flex items-center gap-4">
          {activeSet.logoUrl ? (
            <img src={activeSet.logoUrl} alt={activeSet.name} className="h-12 object-contain" />
          ) : (
            <Library className="w-8 h-8 text-muted-foreground" />
          )}
          <div>
            <h2 className="text-2xl font-bold">{activeSet.name}</h2>
            <p className="text-muted-foreground">{activeSet.printedTotal} cards in this set</p>
          </div>
        </div>

        {errorCards && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <p className="font-medium">{errorCards}</p>
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => loadSetCards(activeSet)}>Retry</Button>
          </div>
        )}

        {isLoadingCards ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[63/88] rounded-xl w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
            {setCards.map(card => (
              <CardGridItem 
                key={card.id} 
                card={card} 
                isOwned={ownedIds.has(card.id)}
                isWanted={wantedIds.has(card.id)}
                onSelect={onSelectCard}
                onAddOwned={onAddOwned}
                onAddWanted={onAddWanted}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input 
          placeholder="Filter sets by name..." 
          className="pl-10 h-12 rounded-xl font-medium"
          value={setFilter}
          onChange={(e) => setSetFilter(e.target.value)}
        />
      </div>

      {errorSets && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <p className="font-medium">{errorSets}</p>
        </div>
      )}

      {isLoadingSets ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-8 pb-8">
          {setsBySeries.map(group => (
            <div key={group.series} className="space-y-3">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-2">{group.series}</h3>
              <div className="space-y-2">
                {group.items.map(set => (
                  <Card 
                    key={set.id} 
                    className="rounded-xl p-3 cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                    onClick={() => loadSetCards(set)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-10 flex items-center justify-center bg-gray-50 rounded-lg p-1">
                        {set.logoUrl ? (
                          <img src={set.logoUrl} alt={set.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                        ) : (
                          <Library className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{set.name}</h4>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span className="truncate">{set.series}</span>
                          <span>•</span>
                          <span>{set.releaseDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pl-2">
                        <div className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                          {set.printedTotal} cards
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          {filteredSets.length === 0 && !isLoadingSets && (
            <div className="text-center py-12 text-muted-foreground">
              No sets found matching your filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}