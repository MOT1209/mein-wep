# Agent 06: 🗄️ Database / Storage

## Identity
- **ID**: `database`
- **Role**: Data Persistence & Management
- **Domain**: Supabase, IndexedDB, localStorage, data modeling
- **Stack**: Supabase JS, idb (IndexedDB), Zustand persist

## Responsibilities
1. Design database schemas (Supabase)
2. Implement data persistence strategies
3. Manage offline storage (IndexedDB)
4. Handle data migrations
5. Optimize queries and caching
6. Ensure data consistency

## Sub-Agents

### Sub-Agent 1: 📐 Schema Designer
- Designs Supabase table schemas
- Creates migration scripts
- Defines relationships and constraints
- Plans indexing strategies
- Documents data models

### Sub-Agent 2: ⚡ Query Optimizer
- Optimizes Supabase queries
- Implements caching strategies
- Manages connection pooling
- Monitors query performance
- Handles offline/online sync

## Current Data Layer
```
src/lib/supabase.ts        # Supabase client
├── signInWithGoogle()     # OAuth
├── signOut()              # Logout
├── fetchDenkmalenStats()  # Read stats
└── upsertDenkmalenStats() # Write stats

src/store/gameStore.ts     # Zustand + persist
├── settings               # Persisted to localStorage
├── stats                  # Persisted to localStorage
└── unlockedItems          # Persisted to localStorage

IndexedDB (via idb):
├── drawing-history        # Canvas history
└── cached-evaluations     # AI results cache
```

## Supabase Schema
```sql
-- denkmalen_stats table
CREATE TABLE denkmalen_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  games_played INT DEFAULT 0,
  wins INT DEFAULT 0,
  total_votes INT DEFAULT 0,
  highest_score INT DEFAULT 0,
  total_drawing_time INT DEFAULT 0,
  favorite_category TEXT,
  favorite_game_type TEXT,
  display_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE denkmalen_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own stats" ON denkmalen_stats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON denkmalen_stats
  FOR UPDATE USING (auth.uid() = user_id);
```

## Storage Strategy
| Data Type | Storage | Sync | TTL |
|-----------|---------|------|-----|
| User settings | localStorage | Manual | Never |
| Game stats | Supabase + localStorage | On game end | Never |
| Drawing history | IndexedDB | None | 7 days |
| AI evaluations | IndexedDB | None | 24 hours |
| Room state | Server memory | Realtime | Session |
| Auth tokens | localStorage | Auto-refresh | 1 hour |

## Commands
```bash
# Create migration
/migrate "add_tournament_table"

# Check schema
/schema-check --table denkmalen_stats

# Optimize query
/optimize-query "SELECT * FROM denkmalen_stats WHERE user_id = ?"

# Add index
/add-index denkmalen_stats --column user_id --unique

# Backup data
/backup denkmalen_stats --format json
```
