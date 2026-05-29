export interface OwnedCard {
  id: string;
  name: string;
  imageUrl: string;
  setName: string;
  cardNumber: string;
  rarity: string;
  quantity: number;
  condition: 'Mint' | 'Near Mint' | 'Lightly Played' | 'Played' | 'Damaged';
  notes: string;
  dateAdded: string; // ISO string
}

export interface WantedCard {
  id: string;
  name: string;
  imageUrl: string;
  setName: string;
  cardNumber: string;
  rarity: string;
  dateAdded: string;
}

const OWNED_KEY = 'pokebinder_owned_cards';
const WANTED_KEY = 'pokebinder_wanted_cards';

export function getOwnedCards(): OwnedCard[] {
  const data = localStorage.getItem(OWNED_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveOwnedCards(cards: OwnedCard[]): void {
  localStorage.setItem(OWNED_KEY, JSON.stringify(cards));
  window.dispatchEvent(new Event('storage-update'));
}

export function addOwnedCard(card: Omit<OwnedCard, 'quantity' | 'condition' | 'notes' | 'dateAdded'>): void {
  const cards = getOwnedCards();
  const existing = cards.find(c => c.id === card.id);
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cards.push({
      ...card,
      quantity: 1,
      condition: 'Near Mint',
      notes: '',
      dateAdded: new Date().toISOString()
    });
  }
  
  saveOwnedCards(cards);
}

export function removeOwnedCard(id: string): void {
  const cards = getOwnedCards();
  const filtered = cards.filter(c => c.id !== id);
  saveOwnedCards(filtered);
}

export function updateOwnedCard(id: string, updates: Partial<OwnedCard>): void {
  const cards = getOwnedCards();
  const index = cards.findIndex(c => c.id === id);
  
  if (index !== -1) {
    cards[index] = { ...cards[index], ...updates };
    saveOwnedCards(cards);
  }
}

export function getWantedCards(): WantedCard[] {
  const data = localStorage.getItem(WANTED_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveWantedCards(cards: WantedCard[]): void {
  localStorage.setItem(WANTED_KEY, JSON.stringify(cards));
  window.dispatchEvent(new Event('storage-update'));
}

export function addWantedCard(card: Omit<WantedCard, 'dateAdded'>): void {
  const cards = getWantedCards();
  const existing = cards.find(c => c.id === card.id);
  
  if (!existing) {
    cards.push({
      ...card,
      dateAdded: new Date().toISOString()
    });
    saveWantedCards(cards);
  }
}

export function removeWantedCard(id: string): void {
  const cards = getWantedCards();
  const filtered = cards.filter(c => c.id !== id);
  saveWantedCards(filtered);
}

export function moveWantedToOwned(id: string): void {
  const wantedCards = getWantedCards();
  const card = wantedCards.find(c => c.id === id);
  
  if (card) {
    removeWantedCard(id);
    addOwnedCard(card);
  }
}
