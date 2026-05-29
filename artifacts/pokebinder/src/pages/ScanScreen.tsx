import { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Loader2, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Tesseract from "tesseract.js";
import { searchCardsByText, PokemonCard } from "@/api/pokemonApi";
import { CardDetailsModal } from "@/components/cards/CardDetailsModal";
import { Link } from "wouter";

export default function ScanScreen() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'searching' | 'success' | 'error'>('idle');
  const [results, setResults] = useState<PokemonCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        logger: m => console.log(m)
      });
      
      // Basic heuristic: find capitalized words that might be a name
      // Pokemon names are usually at the top, bold. OCR is messy.
      const lines = text.split('\n').filter(l => l.trim().length > 2);
      const possibleName = lines.find(l => /^[A-Z]/.test(l.trim())) || text.split(' ')[0] || "Unknown";
      
      // Clean up string
      const cleanName = possibleName.replace(/[^a-zA-Z\s-]/g, '').trim().split(' ')[0];
      
      if (!cleanName || cleanName.length < 3) {
        throw new Error("Could not extract a clear name");
      }

      setStatus('searching');
      const cards = await searchCardsByText(cleanName);
      
      if (cards.length > 0) {
        setResults(cards);
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
                className="bg-white rounded-xl shadow-sm border p-3 flex gap-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedCard(card)}
              >
                <div className="w-20 rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                  <img src={card.imageUrl} alt={card.name} className="w-full" loading="lazy" />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-lg leading-tight">{card.name}</h3>
                  <p className="text-sm text-muted-foreground">{card.setName}</p>
                  <p className="text-xs text-muted-foreground mt-1">#{card.cardNumber} • {card.rarity}</p>
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
              </div>
            )}
          </div>

          {status === 'error' && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-center space-y-2">
              <p className="font-bold">I couldn't read that card clearly.</p>
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
