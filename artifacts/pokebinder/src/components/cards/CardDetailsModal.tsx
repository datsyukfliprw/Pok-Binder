import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Star } from "lucide-react";
import { PokemonCard } from "@/api/pokemonApi";
import { addOwnedCard, addWantedCard } from "@/storage/collectionStorage";
import { useToast } from "@/hooks/use-toast";

interface CardDetailsModalProps {
  card: PokemonCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CardDetailsModal({ card, isOpen, onClose }: CardDetailsModalProps) {
  const { toast } = useToast();

  if (!card) return null;

  const handleAddOwned = () => {
    addOwnedCard({
      id: card.id,
      name: card.name,
      imageUrl: card.imageUrl,
      setName: card.setName,
      cardNumber: card.cardNumber,
      rarity: card.rarity
    });
    toast({
      title: "Added to Collection!",
      description: `${card.name} is now in your binder.`,
    });
  };

  const handleAddWanted = () => {
    addWantedCard({
      id: card.id,
      name: card.name,
      imageUrl: card.imageUrl,
      setName: card.setName,
      cardNumber: card.cardNumber,
      rarity: card.rarity
    });
    toast({
      title: "Added to Wanted List!",
      description: `You're now looking for ${card.name}.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-[95vw] rounded-2xl p-0 gap-0">
        <div className="bg-gray-100 p-6 flex justify-center items-center rounded-t-2xl relative">
          <img 
            src={card.imageUrlLarge || card.imageUrl} 
            alt={card.name} 
            className="w-full max-w-[250px] drop-shadow-xl"
            loading="lazy"
          />
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <div className="flex justify-between items-start mb-2">
              <DialogTitle className="text-2xl font-bold">{card.name}</DialogTitle>
              {card.hp && (
                <Badge variant="secondary" className="text-base font-bold">
                  HP {card.hp}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {card.setName}
              </Badge>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                #{card.cardNumber}
              </Badge>
              {card.rarity && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {card.rarity}
                </Badge>
              )}
            </div>
          </div>

          {(card.artist || card.types || card.marketPrice) && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              {card.types && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Types</span>
                  <span className="font-semibold">{card.types.join(', ')}</span>
                </div>
              )}
              {card.artist && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Artist</span>
                  <span className="font-semibold">{card.artist}</span>
                </div>
              )}
              {card.marketPrice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Market Price</span>
                  <span className="font-semibold text-emerald-600">{card.marketPrice}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button 
              size="lg" 
              className="w-full font-bold h-14 rounded-xl text-base shadow-sm"
              onClick={handleAddOwned}
            >
              <Plus className="w-5 h-5 mr-2" />
              Have It
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="w-full font-bold h-14 rounded-xl text-base border-2 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
              onClick={handleAddWanted}
            >
              <Star className="w-5 h-5 mr-2" />
              Want It
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
