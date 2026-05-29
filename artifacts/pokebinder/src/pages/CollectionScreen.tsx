import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, Plus, Minus, Trash2, Edit2, ChevronDown, Filter, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOwnedCards, updateOwnedCard, removeOwnedCard, OwnedCard } from "@/storage/collectionStorage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const CONDITIONS = ['Mint', 'Near Mint', 'Lightly Played', 'Played', 'Damaged'] as const;

export default function CollectionScreen() {
  const [cards, setCards] = useState<OwnedCard[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = () => {
    setCards(getOwnedCards());
  };

  const handleQuantity = (id: string, current: number, change: number) => {
    const newQuantity = current + change;
    if (newQuantity <= 0) {
      if (confirm("Remove this card from your collection?")) {
        removeOwnedCard(id);
        loadCards();
      }
    } else {
      updateOwnedCard(id, { quantity: newQuantity });
      loadCards();
    }
  };

  const handleConditionChange = (id: string, condition: OwnedCard['condition']) => {
    updateOwnedCard(id, { condition });
    loadCards();
  };

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to remove this card completely?")) {
      removeOwnedCard(id);
      loadCards();
    }
  };

  // Filter and sort
  const filteredCards = cards.filter(card => 
    card.name.toLowerCase().includes(search.toLowerCase()) || 
    card.setName.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case "newest": return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      case "name": return a.name.localeCompare(b.name);
      case "set": return a.setName.localeCompare(b.setName);
      case "qty": return b.quantity - a.quantity;
      default: return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Binder</h1>
          <Badge variant="secondary" className="text-base px-3 py-1 font-bold">
            {cards.reduce((sum, c) => sum + c.quantity, 0)} Cards
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Filter by name or set..." 
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="set">By Set</SelectItem>
              <SelectItem value="qty">By Quantity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your binder is empty!</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Time to start adding your awesome Pokémon cards.
          </p>
          <Link href="/search">
            <Button size="lg" className="rounded-full px-8 font-bold h-14">
              <Search className="w-5 h-5 mr-2" /> Search for Cards
            </Button>
          </Link>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No cards match your filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
          {filteredCards.map(card => (
            <div key={card.id} className="bg-white rounded-xl shadow-sm border p-3 flex flex-col">
              <div className="relative aspect-[63/88] rounded-lg overflow-hidden bg-gray-50 mb-3 group">
                <img 
                  src={card.imageUrl} 
                  alt={card.name} 
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge className="font-bold shadow-sm backdrop-blur-sm bg-black/70 border-0">
                    x{card.quantity}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 leading-tight truncate" title={card.name}>{card.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 truncate" title={card.setName}>
                  {card.setName}
                </p>

                <div className="mt-auto space-y-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full h-8 text-xs font-semibold justify-between bg-gray-50 border-gray-200">
                        {card.condition}
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuLabel>Condition</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {CONDITIONS.map(c => (
                        <DropdownMenuItem 
                          key={c} 
                          onClick={() => handleConditionChange(card.id, c)}
                          className={card.condition === c ? "bg-primary/10 font-bold text-primary" : ""}
                        >
                          {c}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 shrink-0 rounded-l-lg rounded-r-none border-r-0"
                      onClick={() => handleQuantity(card.id, card.quantity, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <div className="h-8 flex-1 flex items-center justify-center font-bold text-sm border-y border-input bg-gray-50">
                      {card.quantity}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 shrink-0 rounded-r-lg rounded-l-none border-l-0"
                      onClick={() => handleQuantity(card.id, card.quantity, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 ml-1 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleRemove(card.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
