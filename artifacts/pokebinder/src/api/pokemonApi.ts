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

export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: string;
  logoUrl: string;
  symbolUrl: string;
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

export async function searchCardsByBroadName(name: string): Promise<PokemonCard[]> {
  if (!name.trim()) return [];
  
  try {
    const res = await fetch(`${API_BASE}/cards?q=name:${name}&pageSize=20`, { headers: HEADERS });
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

export async function getSets(): Promise<PokemonSet[]> {
  try {
    const res = await fetch(`${API_BASE}/sets?orderBy=-releaseDate&pageSize=250`, { headers: HEADERS });
    if (!res.ok) throw new Error('Failed to fetch sets');
    const data = await res.json();
    return data.data.map((set: any) => ({
      id: set.id,
      name: set.name,
      series: set.series,
      printedTotal: set.printedTotal,
      total: set.total,
      releaseDate: set.releaseDate,
      logoUrl: set.images?.logo || '',
      symbolUrl: set.images?.symbol || ''
    }));
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function getCardsBySet(setId: string): Promise<PokemonCard[]> {
  try {
    const res = await fetch(`${API_BASE}/cards?q=set.id:${setId}&pageSize=250&orderBy=number`, { headers: HEADERS });
    if (!res.ok) throw new Error('Failed to fetch cards for set');
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
