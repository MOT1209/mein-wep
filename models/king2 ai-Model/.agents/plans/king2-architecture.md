# KING2 AI Platform Architecture

## 🎯 Goal

Build and maintain KING2 AI — a full-featured Arabic AI platform with:
- Multi-provider AI chat (Gemini, Groq, OpenRouter, ZAI)
- Voice/image analysis and generation
- Self-learning and knowledge base
- Admin dashboard for system management
- Responsive RTL-first Next.js frontend
- Secure authentication (NextAuth + Supabase)

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python FastAPI + Uvicorn |
| Frontend | Next.js 14 App Router (→ 16 planned) |
| Styling | Tailwind CSS v3 (→ v4 planned) |
| AI Providers | Gemini, Groq, OpenRouter, ZAI |
| Database | Supabase (PostgreSQL) + SQLite fallback |
| Auth | NextAuth v4 + bcrypt |
| ORM | Prisma |
| Deployment | Render (backend) + Vercel (frontend) |

## 📁 Project Structure

### Backend (`/`)
```
app.py                    ← FastAPI entry point
king2_engine.py           ← AI engine core
self_learning.py          ← Self-learning engine
database.py               ← SQLite database
supabase_client.py        ← Supabase integration
knowledge_base.py         ← Knowledge base manager
admin_core.py / admin_db.py ← Admin system
skills/                   ← Agent skills
  ├── __init__.py
  ├── base_skill.py
  ├── calculator.py
  └── web_search.py
```

### Frontend (`next-frontend/`)
```
app/
  page.tsx              ← Home page (chat or guest)
  layout.tsx            ← Root layout (RTL, fonts, providers)
  globals.css           ← Design system tokens
  api/                  ← Next.js API routes
  chat/                 ← Chat page
  admin/                ← Admin panel
  auth/                 ← Auth pages (signin, signup)
  settings/             ← User settings
  profile/              ← User profile
  explore/              ← Knowledge exploration
  ...
components/
  AppShell.tsx          ← Main layout shell
  Providers.tsx         ← Session provider
  chat/ChatInterface.tsx ← Chat UI
  layout/               ← Sidebar, Header
lib/
  models.ts             ← AI model router
  providers/            ← Provider implementations
  fallback/             ← Fallback chain logic
  agents/               ← Agent system
  tools/                ← Tool definitions
  planner/              ← Task planner
  memory/               ← Memory integration
  ...
prisma/schema.prisma    ← Database schema
```

## 🔄 AI Data Flow

1. User sends message → `POST /api/chat` (Next.js API route)
2. API route calls `routeStream()` or `routeGenerate()` in `lib/models.ts`
3. Models router uses `executeStreamWithFallback()` to try providers in order:
   - ZAI → Groq → Gemini → OpenRouter
4. For non-streaming: Python backend `POST /chat` with full engine pipeline
5. Engine checks knowledge base → builds context → calls provider → returns response
6. Response saved to `chat_history` table
7. Background: Kaggle search for related knowledge

## 🧠 Agent System

### Planner (`lib/planner/planner.ts`)
- Uses Gemini to analyze user requests
- Breaks complex tasks into steps
- Each step can use a tool from the registry

### Tools (`lib/tools/`)
- Registered in `registry.ts`
- Each tool has name, description, parameters
- Tools are passed to LLM for dynamic selection

### Skills (Python `/skills/`)
- `BaseSkill` interface
- `WebSearchSkill`: Live web browsing (DuckDuckGo + open-webSearch)
- Auto-loaded via `__init__.py`

## 🎨 Design System

See `DESIGN.md` for full documentation.

## 🚀 Key API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/chat` | POST | Main AI chat (streaming optional) |
| `/analyze-image` | POST | Image analysis via Gemini Vision |
| `/generate-image` | POST | Image generation |
| `/auth/register` | POST | User registration |
| `/auth/login` | POST | User login (with rate limiting) |
| `/api/admin/stats` | GET | Dashboard statistics |
| `/api/settings/chats` | GET | Chat history (paginated) |

## 🔐 Security Rules

- API keys never exposed to client
- Rate limiting on auth endpoints (5 attempts → 1hr ban)
- Session tokens with 24hr expiry
- IP blocking for brute force protection
- RASHID_USERNAME reserved for admin
- CORS restricted to known origins

## 📦 Dependencies (Frontend)

```
next, react, react-dom
next-auth, @auth/prisma-adapter
@prisma/client, prisma
@supabase/supabase-js
ai, @ai-sdk/google, @ai-sdk/groq
tailwindcss, postcss, autoprefixer
clsx, tailwind-merge
framer-motion
zod, bcryptjs, date-fns
```

## 🧪 Testing Strategy

- Playwright MCP for browser tests
- Manual: lint (`npm run lint`), build (`npm run build`)
- Verify: auth flow, chat, image analysis, error states

## Known Risks

- Provider API keys can expire → fallback chain required
- S﻿upabase free tier has row limits → implement cleanup jobs
- L﻿arge memory files slow down engine → implement pagination
- R﻿TL + LTR mixed content needs careful CSS testing
