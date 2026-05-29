export interface PokemonCard {
  id: string;
  name: string;
  imageUrl: string;
  imageUrlLarge: string;
  setName: string;
  cardNumber: string;
  rarity: string;
  artist?: string;
  types?: string[];
  hp?: string;
  marketPrice?: string;
}

const API_BASE = 'https://api.pokemontcg.io/v2';
// Add X-Api-Key to headers here if you have one to avoid rate limits
const HEADERS = {};

export async function searchCardsByName(name: string): Promise<PokemonCard[]> {
  if (!name.trim()) return [];
  
  try {
    const res = await fetch(`${API_BASE}/cards?q=name:"*${name}*"&pageSize=20`, { headers: HEADERS });
    if (!res.ok) throw new Error('Failed to fetch cards');
    
    const data = await res.json();
    return data.data.map(mapCardData);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function searchCardsByText(text: string): Promise<PokemonCard[]> {
  if (!text.trim()) return [];
  
  try {
    const res = await fetch(`${API_BASE}/cards?q=name:"*${text}*"&pageSize=3`, { headers: HEADERS });
    if (!res.ok) throw new Error('Failed to fetch cards');
    
    const data = await res.json();
    return data.data.map(mapCardData);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

function mapCardData(card: any): PokemonCard {
  return {
    id: card.id,
    name: card.name,
    imageUrl: card.images?.small || '',
    imageUrlLarge: card.images?.large || '',
    setName: card.set?.name || 'Unknown Set',
    cardNumber: card.number || '0',
    rarity: card.rarity || 'Common',
    artist: card.artist,
    types: card.types,
    hp: card.hp,
    marketPrice: card.cardmarket?.prices?.averageSellPrice 
      ? `$${card.cardmarket.prices.averageSellPrice}` 
      : card.tcgplayer?.prices?.holofoil?.market 
        ? `$${card.tcgplayer.prices.holofoil.market}` 
        : undefined
  };
}
