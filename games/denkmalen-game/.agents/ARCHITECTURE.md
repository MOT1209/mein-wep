# 🤖 Denkmalen AI Agent System — 20 Agents × 2 Sub-Agents

## Overview
A comprehensive multi-agent system designed to develop, maintain, and evolve the Denkmalen drawing game. Each agent has a specialized domain with 2 sub-agents for deeper task decomposition.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    🎯 COMMAND CENTER                         │
│              agent-project-manager (Orchestrator)            │
└─────────────┬───────────────────────────────┬───────────────┘
              │                               │
    ┌─────────▼─────────┐           ┌─────────▼─────────┐
    │  PHASE 1: PLAN    │           │  PHASE 2: EXECUTE │
    │  ┌─────────────┐  │           │  ┌─────────────┐  │
    │  │ architect    │  │           │  │ frontend    │  │
    │  │ security     │  │           │  │ backend     │  │
    │  │ analytics    │  │           │  │ ai-ml       │  │
    │  └─────────────┘  │           │  │ database    │  │
    └───────────────────┘           │  │ realtime    │  │
                                    │  └─────────────┘  │
    ┌───────────────────┐           └───────────────────┘
    │  PHASE 3: QUALITY │
    │  ┌─────────────┐  │           ┌───────────────────┐
    │  │ testing-qa   │  │           │  PHASE 4: SCALE  │
    │  │ performance  │  │           │  ┌─────────────┐  │
    │  │ security     │  │           │  │ plugin-sys  │  │
    │  └─────────────┘  │           │  │ mobile-pwa  │  │
    └───────────────────┘           │  │ devops      │  │
                                    │  └─────────────┘  │
    ┌───────────────────┐           └───────────────────┘
    │  PHASE 5: POLISH  │
    │  ┌─────────────┐  │
    │  │ i18n-a11y   │  │
    │  │ design-sys  │  │
    │  │ content     │  │
    │  │ docs        │  │
    │  └─────────────┘  │
    └───────────────────┘
```

## Agent Registry

| # | Agent ID | Domain | Sub-Agent 1 | Sub-Agent 2 |
|---|----------|--------|-------------|-------------|
| 1 | `project-manager` | Orchestration | task-decomposer | progress-tracker |
| 2 | `architect` | System Design | tech-planner | code-reviewer |
| 3 | `frontend` | UI/UX | component-builder | animation-expert |
| 4 | `backend` | API/Server | api-builder | socket-engineer |
| 5 | `ai-ml` | AI Integration | gemini-integrator | eval-engine |
| 6 | `database` | Data Layer | schema-designer | query-optimizer |
| 7 | `testing-qa` | Quality | unit-tester | e2e-tester |
| 8 | `performance` | Optimization | profiler | bundle-optimizer |
| 9 | `security` | Protection | auth-specialist | vulnerability-scanner |
| 10 | `i18n-a11y` | Localization | translator | a11y-auditor |
| 11 | `mobile-pwa` | Mobile | pwa-engineer | touch-optimizer |
| 12 | `plugin-system` | Extensibility | plugin-architect | plugin-dev |
| 13 | `realtime` | WebSocket | socket-architect | sync-engineer |
| 14 | `content-copy` | Copywriting | ui-writer | seo-writer |
| 15 | `design-system` | Visual | token-manager | component-designer |
| 16 | `analytics` | Metrics | event-tracker | insight-analyzer |
| 17 | `docs` | Documentation | api-docs | user-guide |
| 18 | `devops` | Infrastructure | ci-engineer | deploy-specialist |
| 19 | `sound-audio` | Audio | sfx-engineer | music-curator |
| 20 | `accessibility` | Inclusive | screen-reader | keyboard-nav |

## Workflow Phases

### Phase 1: Planning (agents 1-2, 9, 16)
- Project Manager decomposes tasks
- Architect designs solutions
- Security reviews plans
- Analytics defines metrics

### Phase 2: Execution (agents 3-6, 13)
- Frontend builds UI components
- Backend implements APIs
- AI/ML integrates Gemini
- Database manages data
- Realtime handles Socket.IO

### Phase 3: Quality (agents 7-8, 9)
- Testing writes & runs tests
- Performance profiles & optimizes
- Security scans & hardens

### Phase 4: Scale (agents 11-13, 18)
- Mobile/PWA optimizes for devices
- Plugin system extends capabilities
- DevOps automates deployment

### Phase 5: Polish (agents 10, 14-15, 17, 19-20)
- i18n translates & localizes
- Content writes copy
- Design system ensures consistency
- Docs maintain knowledge
- Sound & accessibility polish

## Agent Communication Protocol

```
Agent A ──[task]──► Agent B
Agent B ──[result]──► Agent A
Agent B ──[decompose]──► Sub-Agent B1
Sub-Agent B1 ──[output]──► Agent B
Agent B ──[output]──► Project Manager
Project Manager ──[status]──► All Agents
```

## File Structure
```
.agents/
├── ARCHITECTURE.md          # This file
├── registry.json            # Agent definitions
├── commands/                # Agent command files
│   ├── 01-project-manager.md
│   ├── 02-architect.md
│   ├── ...
│   └── 20-accessibility.md
└── workflows/               # Multi-agent workflows
    ├── new-feature.md
    ├── bug-fix.md
    ├── performance-audit.md
    └── release.md
```
