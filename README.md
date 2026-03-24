# SwordCraft - Browser-based Idle Game

Browser-based incremental/idle game where you craft weapons, manage a guild, send adventurers on expeditions, and build your crafting empire.

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI primitives
- **Zustand** - Lightweight state management
- **Framer Motion** - Animation library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Turso/libSQL** - Edge-compatible SQLite database
- **Prisma** - ORM (schema defined, direct SQL used in runtime)

### Tooling
- **ESLint** - Code linting with Next.js configuration
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## Project Structure

```
src/
├── app/                  # Next.js App Router (pages + API)
│   ├── api/             # API endpoints
│   ├── page.tsx         # Home page
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── shared/         # Shared components
│   └── screens/        # Game screens (Guild, Forge, Workers, etc.)
├── store/              # Zustand state management
│   ├── slices/         # State slices
│   └── game-store-composed.ts  # Main store
├── lib/                # Utilities and helpers
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── data/               # Static game data (recipes, materials, etc.)
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Turso account (for cloud saves)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd swordcraft-turso-v3
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your Turso credentials:
```
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Game Features

### Crafting System
- Craft various weapons (swords, daggers, axes, bows, etc.)
- Multiple material tiers (wood, stone, iron, steel, silver, gold, mithril)
- Quality system (poor, common, good, excellent, masterpiece, legendary)
- Refine raw materials into ingots

### Guild Management
- Hire adventurers with different classes
- Send adventurers on expeditions
- Complete NPC orders for rewards
- Guild leveling and glory system

### Resource Management
- Mine raw materials (wood, stone, iron, coal, etc.)
- Hire workers to automate resource gathering
- Build and upgrade production buildings
- Manage inventory space

### Progression
- Player leveling and experience
- Unlock new recipes as you progress
- Guild reputation and glory
- Statistics tracking

## Cloud Saves

The game supports cloud saves through Turso database. Saves are automatically:
- Saved every 60 seconds
- Saved when closing the browser
- Synced across devices

Currently uses demo mode without authentication. Authentication will be added in future updates.

## Development Notes

### Code Quality
- Strict TypeScript checking enabled
- ESLint with Next.js rules configured
- Prettier for consistent code formatting
- Type checking enforced before builds

### Known Issues
- Some TypeScript errors exist due to recent strict mode enablement
- ESLint needs to be run with `--fix` to auto-fix many issues
- Guild state uses temporary structure (AdditionalState.guild) instead of dedicated slice

### Future Improvements
- Add authentication (next-auth)
- Implement conflict resolution for cloud saves
- Refactor large files (guild-screen.tsx, craft-slice.ts)
- Split craft-slice into smaller modules
- Add unit and integration tests
- Implement proper error boundaries
- Add localization support

## License

Private project - All rights reserved

## Contributing

This is currently a private project. Contributions are not accepted at this time.
