# 🤖 Denkmalen AI Agent System

## Overview

A comprehensive multi-agent system with **20 specialized agents**, each having **2 sub-agents** (40 total), designed to develop, maintain, and evolve the Denkmalen drawing game.

## 🎯 Quick Start

```bash
# View all agents
cat .agents/registry.json | jq '.agents[].name'

# Read a specific agent
cat .agents/commands/01-project-manager.md

# View workflow
cat .agents/workflows/new-feature.md
```

## 📋 Agent Directory

| # | Agent | Domain | Key Files |
|---|-------|--------|-----------|
| 01 | 🎯 Project Manager | Orchestration | `01-project-manager.md` |
| 02 | 🏗️ Architect | System Design | `02-architect.md` |
| 03 | 🎨 Frontend / UI | Components | `03-frontend.md` |
| 04 | ⚙️ Backend / API | Server Logic | `04-backend.md` |
| 05 | 🧠 AI / ML | Gemini Integration | `05-ai-ml.md` |
| 06 | 🗄️ Database | Data Layer | `06-database.md` |
| 07 | 🧪 Testing / QA | Quality | `07-testing-qa.md` |
| 08 | ⚡ Performance | Optimization | `08-performance.md` |
| 09 | 🔒 Security | Protection | `09-security.md` |
| 10 | 🌍 i18n / Accessibility | Localization | `10-i18n-a11y.md` |
| 11 | 📱 Mobile / PWA | Mobile Experience | `11-mobile-pwa.md` |
| 12 | 🔌 Plugin System | Extensibility | `12-plugin-system.md` |
| 13 | ⚡ Realtime | WebSocket | `13-realtime.md` |
| 14 | 📝 Content / Copywriting | Copy | `14-content-copy.md` |
| 15 | 🎨 Design System | Visual Design | `15-design-system.md` |
| 16 | 📊 Analytics | Metrics | `16-analytics.md` |
| 17 | 📚 Documentation | Knowledge | `17-docs.md` |
| 18 | 🚀 DevOps | Infrastructure | `18-devops.md` |
| 19 | 🔊 Sound / Audio | Audio | `19-sound-audio.md` |
| 20 | ♿ Accessibility | Inclusive Design | `20-accessibility.md` |

## 🔄 Workflows

### 1. New Feature Development (10-18 hours)
```
Planning → Development → Quality → Polish → Deployment
```

### 2. Bug Fix (3-7 hours)
```
Triage → Diagnosis → Fix → Verify → Deploy
```

### 3. Performance Audit (7-14 hours)
```
Measurement → Analysis → Optimization → Validation
```

### 4. Release (5-9 hours)
```
Pre-Release → Code Freeze → Deployment → Post-Release
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                 COMMAND CENTER                       │
│            🎯 Project Manager (Orchestrator)         │
└─────────────┬─────────────────────────────┬─────────┘
              │                             │
    ┌─────────▼─────────┐         ┌─────────▼─────────┐
    │   PHASE 1: PLAN   │         │  PHASE 2: BUILD   │
    │  🏗️ Architect      │         │  🎨 Frontend       │
    │  🔒 Security       │         │  ⚙️ Backend        │
    │  📊 Analytics      │         │  🧠 AI/ML          │
    └───────────────────┘         │  🗄️ Database       │
                                  │  ⚡ Realtime       │
    ┌───────────────────┐         └───────────────────┘
    │  PHASE 3: TEST    │
    │  🧪 Testing/QA    │         ┌───────────────────┐
    │  ⚡ Performance    │         │  PHASE 4: SCALE   │
    │  🔒 Security      │         │  📱 Mobile/PWA     │
    └───────────────────┘         │  🔌 Plugin System  │
                                  │  🚀 DevOps         │
    ┌───────────────────┐         └───────────────────┘
    │  PHASE 5: POLISH  │
    │  🌍 i18n/A11y      │
    │  🎨 Design System  │
    │  📝 Content        │
    │  📚 Documentation  │
    │  🔊 Sound/Audio    │
    │  ♿ Accessibility   │
    └───────────────────┘
```

## 📁 File Structure

```
.agents/
├── ARCHITECTURE.md      # System architecture overview
├── README.md            # This file
├── registry.json        # Agent definitions & relationships
├── commands/            # Agent command files (20)
│   ├── 01-project-manager.md
│   ├── 02-architect.md
│   ├── ...
│   └── 20-accessibility.md
└── workflows/           # Multi-agent workflows (4)
    ├── new-feature.md
    ├── bug-fix.md
    ├── performance-audit.md
    └── release.md
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| State | Zustand |
| Realtime | Socket.IO |
| AI | Google Gemini |
| Database | Supabase |
| Audio | Howler.js |
| Testing | Jest, React Testing Library |
| Deployment | Vercel, Railway/Render |

## 📊 Project Stats

- **Total Agents**: 20
- **Total Sub-Agents**: 40
- **Components**: 28+
- **API Routes**: 2 (evaluate, health)
- **Plugins**: 10 (1 implemented)
- **Languages**: 3 (EN, AR, DE)
- **Word Database**: 330+ words

## 🚀 Usage

Each agent file contains:
1. **Identity**: Role and responsibilities
2. **Sub-Agents**: Two specialized sub-agents
3. **Commands**: Available commands
4. **Integration Points**: How it connects to other agents
5. **Output Format**: Expected deliverables

## 📝 License

Part of the Denkmalen project - MIT License
