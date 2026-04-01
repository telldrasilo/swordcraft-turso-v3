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
- `npm run test` - Run Vitest unit tests once
- `npm run test:watch` - Vitest watch mode
- `npm run test:coverage` - Tests with V8 coverage report (`coverage/`)
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

## Saves (local + optional cloud)

**By default**, progress is stored in the browser via **Zustand persist** (`localStorage`, key `swordcraft-store-v2`). The `use-cloud-save` hook also writes a local backup (`swordcraft-offline-backup`) and can autosave on an interval.

**Cloud sync (Turso)** is **opt-in**. Set in `.env`:

```env
NEXT_PUBLIC_CLOUD_SAVE_ENABLED=true
```

and configure `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` (see `.env.example`). When cloud is off, `/api/save` returns `503` with `cloudSaveDisabled`; the client does not call it. When on: periodic server saves (~60s), beacon on tab close, load on startup — see `src/lib/cloud-save-feature.ts` for a schema checklist when adding new persisted fields.

Authentication policy for production saves is documented in `src/lib/save-auth.ts` (NextAuth / demo provider).

## Development Notes

### Code Quality
- Strict TypeScript checking enabled
- ESLint with Next.js rules configured
- Prettier for consistent code formatting
- Type checking enforced before builds
- **Tests:** Vitest; test files `src/**/*.test.ts`. Run `npm run test` before pushing; CI runs `npm run test`, `npm run test:coverage` (thresholds on `src/lib/**`), then `npm run build`.
- Conventions and CI details for agents: see **«Тесты и проверка качества»** in [AGENTS.md](AGENTS.md).

### Known Issues
- Residual ESLint warnings (`any`, non-null assertions, etc.); CI does not enforce `--max-warnings 0`
- Guild state uses temporary structure (AdditionalState.guild) instead of dedicated slice

### Future Improvements
- Add authentication (next-auth)
- Implement conflict resolution for cloud saves
- Refactor large files (guild-screen.tsx, craft-slice.ts)
- Split craft-slice into smaller modules
- Expand integration / E2E tests (e.g. Playwright) on top of existing Vitest unit suite
- Implement proper error boundaries
- Add localization support

## License

Private project - All rights reserved

## Contributing

This is currently a private project. Contributions are not accepted at this time.
