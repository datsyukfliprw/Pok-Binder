# PokéBinder

A kid-friendly Pokémon card collection catalog — React/Vite PWA that lets children catalog owned cards, search the Pokémon TCG API, manage a wish list, and scan cards with OCR.

## Run & Operate

- `pnpm --filter @workspace/pokebinder run dev` — run the app
- `pnpm --filter @workspace/pokebinder run build` — build the app
- `pnpm --filter @workspace/pokebinder typecheck` — typecheck the app

## Stack

- React 18, Vite, TypeScript, Tailwind, shadcn/ui, wouter, Tesseract.js, Pokémon TCG API

## Where things live

- `artifacts/pokebinder/src/pages/` - Application screens
- `artifacts/pokebinder/src/api/` - Pokémon TCG API integration
- `artifacts/pokebinder/src/storage/` - LocalStorage data management
- `artifacts/pokebinder/src/components/` - Reusable UI components

## Product

- **Home**: Dashboard showing collection stats, quick action buttons, and recently added cards.
- **Search**: Search the Pokémon TCG API for cards by name. Add them to collection or wishlist.
- **Collection**: View and manage owned cards. Filter by set, rarity, search by name, and edit notes/conditions.
- **Wanted**: View and manage the wishlist. Move cards to collection when acquired.
- **Scan**: Use the device camera to take a photo of a card, extract text using OCR, and automatically find the matching card.
- **Settings**: Export and import collection data as JSON, or clear all data.

## User preferences

## Gotchas

- All data is stored in `localStorage`. There is no backend database.
- Tesseract.js downloads language models on first run.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details