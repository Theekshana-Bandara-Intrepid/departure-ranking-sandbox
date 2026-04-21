# Departure Ranking Sandbox

## Introduction

This project explores how product-level attraction scoring can solve the cold-start problem in search indexes that handle rotating inventory. Travel products like departure packages are created with new dates frequently, and each new departure starts with no engagement signals or ranking history. A custom scoring pipeline aggregates booking and engagement data at the product level instead of the individual record level, allowing new departures to immediately inherit their parent product's ranking power. This learning sandbox demonstrates how to build, calculate, and apply these custom scores using a daily pipeline that processes historical demand patterns and regional performance, then pushes updated rankings back to the search system. The goal is to create a more stable and context-aware ranking approach that prevents the system from starting from zero each time new inventory is added.

## Tech Stack

- **Framework**: Nuxt 4 with Vue 3 for the user interface
- **Server**: Nitro for backend API routes and server-side logic
- **Language**: TypeScript for type-safe code
- **Frontend Build**: Vite for fast development and production builds
- **Data**: JSON files for departure and product score datasets
- **Styling**: CSS for component styling

## Data Flow

The pipeline works through three main steps:

1. **Load Data** - Read departures and product scores from JSON files to retrieve current booking counts and seasonal information.

2. **Calculate Scores** - Find the highest booking count per market to set a ceiling. Normalize all other products relative to that ceiling on a 0 to 100 scale. Apply seasonal multipliers to products based on the current month to surface trips that are historically popular right now.

3. **Update Search System** - Return recalculated scores that will be pushed back to the search platform. Each new departure record instantly receives its parent product's calculated attraction score, ensuring that ranking power is inherited rather than starting from zero.

The system runs on demand via API endpoints and can be adapted to run as a scheduled daily job in production.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
