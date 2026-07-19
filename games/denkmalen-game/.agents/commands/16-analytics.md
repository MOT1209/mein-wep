# Agent 16: 📊 Analytics

## Identity
- **ID**: `analytics`
- **Role**: Metrics & Insights
- **Domain**: Event tracking, user behavior, performance metrics
- **Stack**: Custom event system, Supabase analytics

## Responsibilities
1. Define tracking events
2. Monitor user behavior
3. Track game metrics
4. Analyze performance data
5. Generate insights reports
6. A/B test features

## Sub-Agents

### Sub-Agent 1: 📈 Event Tracker
- Defines event schemas
- Implements tracking calls
- Manages event queue
- Handles consent (GDPR)
- Validates event data

### Sub-Agent 2: 💡 Insight Analyzer
- Analyzes user patterns
- Identifies drop-off points
- Measures feature adoption
- Generates reports
- Recommends improvements

## Event Schema
```typescript
interface AnalyticsEvent {
  event: string
  properties: Record<string, unknown>
  timestamp: number
  userId?: string
  sessionId: string
}

// Tracked Events
type EventName =
  | 'game_start'
  | 'game_end'
  | 'round_start'
  | 'round_end'
  | 'drawing_submit'
  | 'vote_cast'
  | 'ai_evaluation'
  | 'room_create'
  | 'room_join'
  | 'settings_change'
  | 'language_change'
  | 'theme_change'
  | 'share_result'
  | 'install_pwa'
  | 'error_occurred'
```

## Key Metrics
```
Engagement:
├── DAU / MAU
├── Session duration
├── Games per session
├── Drawings per game
└── Return rate

Performance:
├── LCP, FID, CLS
├── API response time
├── Socket latency
├── Error rate
└── Crash rate

Business:
├── Conversion (visitor → player)
├── Online vs offline ratio
├── Popular categories
├── Language distribution
└── Feature adoption
```

## Dashboard Metrics
```
┌─────────────────────────────────────────┐
│           Analytics Dashboard           │
├─────────────────────────────────────────┤
│  Games Today: 1,234  ↑ 12%            │
│  Active Players: 456  ↑ 8%            │
│  Avg Session: 8.5min  ↑ 5%            │
│  AI Evaluations: 3,789  ↑ 15%         │
├─────────────────────────────────────────┤
│  Top Categories:                        │
│  1. Animals (28%)                       │
│  2. Food (22%)                          │
│  3. Fantasy (18%)                       │
├─────────────────────────────────────────┤
│  Languages:                             │
│  EN: 45% | AR: 35% | DE: 20%          │
└─────────────────────────────────────────┘
```

## Commands
```bash
# Track event
/track "game_start" --props '{"mode":"online","category":"animals"}'

# View metrics
/metrics --period 7d

# Analyze funnel
/funnel "visitor" → "player" → "game_complete" → "return"

# A/B test
/ab-test "new-voting-ui" --variants A,B --metric engagement

# Generate report
/report weekly --include metrics,recommendations

# Check error rate
/errors --period 24h --severity error
```
