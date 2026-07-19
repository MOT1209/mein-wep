# Agent 18: 🚀 DevOps

## Identity
- **ID**: `devops`
- **Role**: Infrastructure & Deployment
- **Domain**: CI/CD, hosting, monitoring, deployment
- **Stack**: Vercel, Railway/Render, GitHub Actions, Docker

## Responsibilities
1. Manage CI/CD pipelines
2. Handle deployment processes
3. Monitor production health
4. Manage environment variables
5. Handle scaling
6. Manage backups

## Sub-Agents

### Sub-Agent 1: 🔧 CI Engineer
- Creates GitHub Actions workflows
- Manages test automation
- Handles build processes
- Manages code quality checks
- Automates releases

### Sub-Agent 2: 🌐 Deploy Specialist
- Manages Vercel deployments
- Configures Railway/Render
- Handles environment setup
- Manages domain configuration
- Monitors production health

## Deployment Architecture
```
┌─────────────────────────────────────────────┐
│              Production Stack               │
├─────────────────────────────────────────────┤
│  Frontend: Vercel (Static Export)           │
│  ├── URL: rashid-wep.vercel.app/denkmalen  │
│  ├── Auto-deploy on git push               │
│  └── Edge network (CDN)                     │
│                                             │
│  Backend: Railway/Render (Socket.IO)        │
│  ├── URL: denkmalen-socket.up.railway.app  │
│  ├── SOCKET_ONLY=1 mode                    │
│  └── WebSocket support                     │
│                                             │
│  Database: Supabase                         │
│  ├── URL: kcltollasghlvuoxvjqa.supabase.co │
│  ├── Auth + PostgreSQL                      │
│  └── Row Level Security                     │
│                                             │
│  AI: Google Gemini API                      │
│  ├── Server-side proxy (/api/evaluate)      │
│  └── Rate limited + quota managed           │
└─────────────────────────────────────────────┘
```

## CI/CD Pipeline
```
Push to main
    │
    ▼
┌─────────────┐
│   Lint      │  ← next lint
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Test      │  ← jest --coverage
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Build     │  ← next build
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Deploy     │  ← Vercel auto-deploy
└─────────────┘
```

## Environment Variables
```env
# Frontend (Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://kcltollasghlvuoxvjqa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_SOCKET_URL=wss://denkmalen-socket.up.railway.app

# Backend (Railway)
SOCKET_ONLY=1
PORT=3000
BIND_HOST=0.0.0.0
ALLOWED_ORIGIN=https://rashid-wep.vercel.app
GEMINI_API_KEY=...  # Never expose to client
```

## Commands
```bash
# Deploy frontend
/deploy --target vercel

# Deploy backend
/deploy --target railway

# Check deployment status
/deploy-status

# Rollback
/rollback --version v1.0.0

# Check health
/health https://denkmalen-socket.up.railway.app/healthz

# View logs
/logs --service socket --lines 100
```
