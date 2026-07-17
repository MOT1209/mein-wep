# CRITICAL RULES - MUST FOLLOW

## RESPONSES

- Keep responses concise and to the point - unless the user asks otherwise
- Communication is in Arabic, direct and fast, no filler

## PLANNING MODE

- Always ask clarifying questions before implementing
- Never assume design, tech stack or features
- Use deep-dive sub-agents to assist with research
- Use deep-dive sub-agents to review plans before presenting

## CHANGE / EDIT MODE

- Never implement features yourself when possible - use sub-agents!
- Identify changes from the plan that can be implemented in parallel
- When using sub-agents, act as a coordinator only
- Use the best model for the task - premium for complex coding, mid-tier for docs
- After completing features, ALWAYS run: lint, type check, build

## DATABASE SCHEMA CHANGES

- Whenever you make changes to the Prisma schema, ALWAYS run:
  - `npm run db:generate` (in next-frontend)
  - `npm run db:push` (for development)
- NEVER run `prisma db push` on production databases directly

## TESTING

- Use Playwright MCP for browser testing
- Never assume changes simply work - always test!
- If testing tools aren't available, ask the user whether to skip

## API KEYS & SECURITY

- Never expose OpenRouter/Gemini/Groq/ZAI API keys to client components
- Never commit `.env` files
- Validate all environment variables at startup (see app.py pattern)

## UI DESIGN

- Always follow KING2 design system when creating or reviewing components
- Design System: @DESIGN.md
- Dark theme first, RTL support mandatory
