import { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Loader2, Search, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Tesseract from "tesseract.js";
import { searchCardsByText, PokemonCard } from "@/api/pokemonApi";
import { CardDetailsModal } from "@/components/cards/CardDetailsModal";
import { Link } from "wouter";
import { addOwnedCard, addWantedCard } from "@/storage/collectionStorage";
import { useToast } from "@/hooks/use-toast";

const extractCandidates = (text: string): string[] => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1);
  const candidates: string[] = [];

  // 1. Word immediately before "HP" on same line: "Pikachu 60HP" → "Pikachu"
  for (const line of lines) {
    const hpMatch = line.match(/([A-Z][a-zA-Z\-]+)\s+\d+\s*HP/i);
    if (hpMatch) candidates.push(hpMatch[1]);
  }

  // 2. First capitalized word/phrase in first 3 lines (likely name near card top)
  for (const line of lines.slice(0, 3)) {
    const match = line.match(/^([A-Z][a-zA-Z\-]+(?:\s+[A-Z][a-zA-Z\-]+)?)/);
    if (match && match[1].length >= 3) candidates.push(match[1].split(' ')[0]);
  }

  // 3. All capitalized words 3+ chars
  const capitalWords = text.match(/\b[A-Z][a-z]{2,}\b/g) || [];
  candidates.push(...capitalWords.slice(0, 5));

  // Deduplicate and filter noise words
  const noiseWords = new Set(['The','And','For','Set','Card','Basic','Stage','Level',
    'Energy','Trainer','Supporter','Item','Stadium','Pokemon','Attack','Ability',
    'Retreat','Weakness','Resistance','Damage','Counter','Special','Rule']);
  return [...new Set(candidates)].filter(c => !noiseWords.has(c) && c.length >= 3);
};

export default function ScanScreen() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'searching' | 'success' | 'error'>('idle');
  const [currentCandidate, setCurrentCandidate] = useState<string>('');
  const [results, setResults] = useState<PokemonCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setStatus('idle');
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!imagePreview) return;
    
    setStatus('scanning');
    try {
      const { data: { text } } = await Tesseract.recognize(imagePreview, 'eng', {
        logger: () => {}
      });
      
      const candidates = extractCandidates(text);
      
      if (candidates.length === 0) {
        throw new Error("Could not extract any potential names");
      }

      // Check if there is a card number pattern (e.g. 025/198)
      const numberMatch = text.match(/\b(\d{1,3})\/\d{1,3}\b/);
      const targetCardNumber = numberMatch ? numberMatch[1] : null;

      setStatus('searching');
      let foundCards: PokemonCard[] = [];
      
      for (const candidate of candidates) {
        setCurrentCandidate(candidate);
        const cards = await searchCardsByText(candidate);
        if (cards.length > 0) {
          if (targetCardNumber) {
             const exactMatches = cards.filter(c => c.cardNumber.includes(targetCardNumber));
             if (exactMatches.length > 0) {
               foundCards = exactMatches;
             } else {
               foundCards = cards;
             }
          } else {
            foundCards = cards;
          }
          break;
        }
      }
      
      if (foundCards.length > 0) {
        setResults(foundCards.slice(0, 3));
        setStatus('success');
      } else {
        throw new Error("No cards found matching that text");
      }

    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const reset = () => {
    setImagePreview(null);
    setStatus('idle');
    setResults([]);
    setCurrentCandidate('');
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
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Scan Card</h1>
        <p className="text-muted-foreground">Take a clear photo of your card to identify it.</p>
      </div>

      {!imagePreview ? (
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center h-64">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-1">Tap to Camera</h3>
            <p className="text-sm text-muted-foreground">Take a photo or choose from gallery</p>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
          </CardContent>
        </Card>
      ) : status === 'success' ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-1">I think this might be...</h2>
            <p className="text-sm text-muted-foreground">Tap a card to view details and add it.</p>
          </div>
          
          <div className="grid gap-4">
            {results.map(card => (
              <div 
                key={card.id} 
                className="bg-white rounded-xl shadow-sm border p-3 flex flex-col gap-3 hover:border-primary transition-colors cursor-pointer"
                onClick={() => setSelectedCard(card)}
              >
                <div className="flex gap-4">
                  <div className="w-20 rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                    <img src={card.imageUrl} alt={card.name} className="w-full" loading="lazy" />
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <h3 className="font-bold text-lg leading-tight">{card.name}</h3>
                    <p className="text-sm text-muted-foreground">{card.setName}</p>
                    <p className="text-xs text-muted-foreground mt-1">#{card.cardNumber} • {card.rarity}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 h-10 font-bold text-xs btn-touch" 
                    onClick={(e) => handleQuickAdd(e, card, 'owned')}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Have
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 h-10 font-bold text-xs btn-touch"
                    onClick={(e) => handleQuickAdd(e, card, 'wanted')}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Want
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 font-bold h-12" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" /> Scan Another
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden shadow-md border-4 border-white bg-black">
            <img src={imagePreview} alt="Preview" className="w-full object-contain max-h-80" />
            {(status === 'scanning' || status === 'searching') && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                <p className="font-bold text-lg animate-pulse">
                  {status === 'scanning' ? "Reading card text..." : "Searching database..."}
                </p>
                {status === 'searching' && currentCandidate && (
                  <p className="text-sm mt-2 text-primary-foreground/80">Looking for: {currentCandidate}</p>
                )}
              </div>
            )}
          </div>

          {status === 'error' && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-center space-y-2">
              <p className="font-bold">I couldn't identify that card clearly.</p>
              <p className="text-sm">Try a clearer picture without glare, or search manually.</p>
            </div>
          )}

          {status === 'idle' || status === 'error' ? (
            <div className="grid gap-3">
              {status === 'idle' && (
                <Button size="lg" className="w-full font-bold h-14 text-lg rounded-xl" onClick={handleScan}>
                  <Search className="w-5 h-5 mr-2" /> Identify Card
                </Button>
              )}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 font-bold h-12" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="w-4 h-4 mr-2" /> Retake
                </Button>
                <Link href="/search" className="flex-1">
                  <Button variant="secondary" className="w-full font-bold h-12">
                    Search Manually
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}
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
