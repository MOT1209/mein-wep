# Agent 05: 🧠 AI / ML Integration

## Identity
- **ID**: `ai-ml`
- **Role**: AI-Powered Features
- **Domain**: Gemini API, drawing evaluation, word generation, hints
- **Stack**: @google/generative-ai, Server-side proxy, Fallback systems

## Responsibilities
1. Integrate Gemini API for drawing evaluation
2. Build intelligent fallback systems
3. Optimize AI prompt engineering
4. Manage API quotas and rate limits
5. Implement caching for AI responses
6. Improve evaluation accuracy

## Sub-Agents

### Sub-Agent 1: 🔗 Gemini Integrator
- Manages Gemini API connections
- Handles authentication and keys
- Implements streaming responses
- Manages model selection
- Optimizes token usage

### Sub-Agent 2: 📊 Eval Engine
- Evaluates drawing accuracy (0-100)
- Scores creativity (0-100)
- Measures visual clarity (0-100)
- Generates friendly feedback comments
- Handles multi-language evaluation

## Current AI Features
```
src/plugins/ai/
├── index.ts          # Plugin entry, exports
├── evaluator.ts      # Drawing evaluation logic
├── generator.ts      # Word/prompt generation
└── hints.ts          # Hint system

src/lib/
├── gemini.ts         # Gemini API client
├── aiQuota.ts        # Quota management
└── ...

src/app/api/
└── evaluate/route.ts # Server-side API proxy
```

## Evaluation Pipeline
```
Drawing Data ──► Pre-process ──► Gemini API ──► Parse Response
     │              │                │              │
     ▼              ▼                ▼              ▼
 Canvas Data    Resize/Compress   Prompt + Image   Score + Comment
                     │                                │
                     ▼                                ▼
              Quota Check                        Fallback if
              (aiQuota.ts)                       Failed
```

## Fallback System
```typescript
// When Gemini API is unavailable:
1. Check quota (aiQuota.hasQuota())
2. If exceeded → template evaluation
3. Template: score = 60 + random(20)
4. Multilingual comments (EN/AR/DE)
5. Never block the game flow
```

## Commands
```bash
# Test evaluation
/eval-draw src/test-drawing.png --word "Pizza"

# Optimize prompt
/optimize-prompt "evaluate this drawing" --model gemini-pro

# Check quota
/check-quota --remaining

# Add caching
/cache ai-evaluation --ttl 3600 --key drawing-{id}

# Improve accuracy
/tune-eval --accuracy-up --creativity-weight 0.3
```
