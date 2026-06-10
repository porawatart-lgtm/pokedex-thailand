# Pokédex Thailand — Setup Guide

## Quick Start (5 นาที)

### 1. Clone & Install

```bash
cd Pokemon
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# แก้ไข .env ให้ครบ (โดยเฉพาะ DATABASE_URL และ ANTHROPIC_API_KEY)
```

### 3. Start with Docker (แนะนำ)

```bash
# Start PostgreSQL + Redis
docker compose up postgres redis -d

# Setup database
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

### 4. Import Pokemon Data

```bash
# Import ทั้งหมด (1025 ตัว ใช้เวลา ~10 นาที)
npx tsx scripts/import-pokemon.ts

# หรือ import ทีละ Gen
npx tsx scripts/import-pokemon.ts --gen=1  # Gen 1 (151 ตัว)
npx tsx scripts/import-pokemon.ts --gen=9  # Gen 9 (120 ตัว)
```

### 5. Open the App

เปิดเบราว์เซอร์ไปที่ http://localhost:3000

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| State | TanStack Query, Zustand |
| Backend | Next.js API Routes (Node.js) |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| AI | Anthropic Claude (Sonnet/Haiku) |
| Auth | NextAuth.js |
| Deploy | Docker + Nginx |

---

## Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── page.tsx            # Home page
│   ├── layout.tsx          # Root layout
│   ├── pokedex/            # Pokédex listing + detail
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── moves/              # Moves database
│   ├── items/              # Items database
│   ├── abilities/          # Abilities database
│   ├── team-builder/       # Team Builder
│   ├── competitive/        # Competitive Center
│   ├── calc/               # Damage Calculator
│   ├── ai-team/            # AI Team Builder
│   ├── ai-chat/            # AI Chat
│   ├── admin/              # Admin Dashboard
│   └── api/                # API Routes
│       ├── pokemon/
│       ├── moves/
│       ├── types/
│       ├── ai/team/
│       ├── ai/chat/
│       └── battle/calc/
│
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── pokemon/            # PokemonCard, TypeBadge, StatBar, TypeChartTable
│   └── providers/          # Theme, Query providers
│
├── lib/
│   ├── pokeapi.ts          # PokéAPI client
│   ├── type-chart.ts       # Type effectiveness engine
│   ├── battle-engine.ts    # Damage calculator
│   ├── ai.ts               # Claude AI client
│   ├── db.ts               # Prisma client
│   └── utils.ts            # Helpers
│
├── types/
│   └── pokemon.ts          # All TypeScript types
│
└── store/                  # Zustand stores (add as needed)

prisma/
├── schema.prisma           # Full database schema
└── seed.ts                 # Seed data

scripts/
└── import-pokemon.ts       # PokéAPI importer

docker/
├── nginx/nginx.conf        # Production Nginx config
└── postgres/init.sql       # DB init

.github/
└── workflows/ci.yml        # GitHub Actions CI/CD
```

---

## Features ที่พร้อมใช้งาน

- ✅ **Pokédex** — ดูโปเกมอนทุกตัว Gen 1-9 พร้อมฟิลเตอร์
- ✅ **Pokémon Detail** — Stats, Types, Abilities, Moves, Evolutions
- ✅ **Type Chart** — ตาราง Type Effectiveness ครบ 18 ประเภท
- ✅ **Team Builder** — สร้างทีม 6 ตัว วิเคราะห์ Weakness/Coverage
- ✅ **Damage Calculator** — คำนวณดาเมจ Nature/EV/IV/Weather/Terrain
- ✅ **Competitive Center** — Tier List, Usage Stats
- ✅ **AI Team Builder** — Claude AI สร้างทีมพร้อมคำอธิบาย (ต้องการ API Key)
- ✅ **AI Chat** — ถามผู้เชี่ยวชาญ AI เรื่อง Pokémon (ต้องการ API Key)
- ✅ **Moves Database** — ท่าโจมตีทุกท่าพร้อมข้อมูล
- ✅ **Admin Dashboard** — จัดการระบบ
- ✅ **PWA Ready** — ติดตั้งเป็น App ได้

## เพิ่มเติมในอนาคต

- [ ] Items Database (UI พร้อม, รอ import data)
- [ ] Abilities Database (UI พร้อม, รอ import data)
- [ ] Battle Simulator (Pokémon Showdown style)
- [ ] Living Dex / Shiny Dex tracking
- [ ] Community posts & Teams sharing
- [ ] User Auth (NextAuth)
- [ ] Trainer Card builder
- [ ] Achievement system
- [ ] Pokémon GO / TCG expansion

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `NEXTAUTH_SECRET` | Random secret for sessions | ✅ |
| `NEXTAUTH_URL` | App URL | ✅ |
| `ANTHROPIC_API_KEY` | Claude AI API key | ⚡ (AI features) |
| `GOOGLE_CLIENT_ID` | Google OAuth | 🔧 (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | 🔧 (optional) |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pokemon` | List Pokémon (pagination, filter) |
| GET | `/api/pokemon/:id` | Pokémon detail |
| GET | `/api/moves` | List moves |
| GET | `/api/types` | Type chart data |
| POST | `/api/battle/calc` | Damage calculation |
| POST | `/api/ai/team` | AI team generation |
| POST | `/api/ai/chat` | AI chat response |

---

Made with ❤️ in Thailand | Powered by PokéAPI + Claude AI
