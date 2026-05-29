import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PokemonCard } from "@/api/pokemonApi";

interface CardGridItemProps {
  card: PokemonCard;
  isOwned: boolean;
  isWanted: boolean;
  onSelect: (card: PokemonCard) => void;
  onAddOwned: (e: React.MouseEvent, card: PokemonCard) => void;
  onAddWanted: (e: React.MouseEvent, card: PokemonCard) => void;
}

export function CardGridItem({
  card,
  isOwned,
  isWanted,
  onSelect,
  onAddOwned,
  onAddWanted
}: CardGridItemProps) {
  return (
    <div 
      className="group flex flex-col bg-white rounded-xl shadow-sm border p-3 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
      onClick={() => onSelect(card)}
      data-testid={`card-item-${card.id}`}
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
          {isOwned ? (
            <Button size="sm" variant="secondary" className="flex-1 h-10 font-bold text-xs pointer-events-none" disabled>
              <Check className="w-4 h-4 mr-1" /> Collected
            </Button>
          ) : (
            <Button size="sm" className="flex-1 h-10 font-bold text-xs btn-touch" onClick={(e) => onAddOwned(e, card)}>
              Collected
            </Button>
          )}
          {isWanted ? (
            <Button size="sm" variant="secondary" className="flex-1 h-10 font-bold text-xs pointer-events-none" disabled>
              <Check className="w-4 h-4 mr-1" /> On List
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="flex-1 h-10 font-bold text-xs btn-touch" onClick={(e) => onAddWanted(e, card)}>
              Wanted
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}