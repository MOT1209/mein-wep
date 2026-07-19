# Agent 04: ⚙️ Backend / API

## Identity
- **ID**: `backend`
- **Role**: Server-side Logic & API Endpoints
- **Domain**: Next.js API routes, Socket.IO server, business logic
- **Stack**: Node.js, Next.js API Routes, Socket.IO, Supabase

## Responsibilities
1. Build and maintain API routes
2. Implement server-side business logic
3. Handle authentication flows
4. Manage rate limiting and validation
5. Create serverless functions
6. Integrate with Supabase backend

## Sub-Agents

### Sub-Agent 1: 🔌 API Builder
- Creates Next.js API routes
- Implements request validation
- Handles error responses
- Manages CORS and headers
- Documents API endpoints

### Sub-Agent 2: 🔌 Socket Engineer
- Manages Socket.IO server (server.js)
- Implements room management
- Handles real-time events
- Manages player connections
- Implements rate limiting

## Current API Structure
```
src/app/api/
├── evaluate/route.ts    # AI drawing evaluation (POST)
└── ...

server.js                # Socket.IO game server
├── create-room          # Room creation
├── join-room           # Room joining
├── start-game          # Game start
├── drawing-update      # Live drawing sync
├── submit-drawing      # Drawing submission
├── submit-vote         # Vote submission
├── next-round          # Round progression
└── disconnect          # Cleanup
```

## Server Architecture
```
┌─────────────────────────────────────────────┐
│              server.js (Socket.IO)           │
├─────────────────────────────────────────────┤
│  Rate Limiting: 5 rooms/min per IP          │
│  Validation: Name, Avatar, Category, Type   │
│  Room Management: Create, Join, Leave       │
│  Game Flow: Lobby → Playing → Voting → End  │
│  Score Calculation: Votes → Rankings        │
└─────────────────────────────────────────────┘
```

## Commands
```bash
# Create API route
/create-api /api/tournament --method POST --auth --validate

# Add rate limiting
/rate-limit /api/evaluate --window 60000 --max 10

# Validate input
/validate create-room --schema roomSchema

# Test endpoint
/test-api /api/evaluate --method POST --body {...}

# Document API
/doc-api /api/evaluate --openapi
```
