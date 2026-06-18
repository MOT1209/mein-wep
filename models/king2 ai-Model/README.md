# KING2 AI

KING2 AI is an Arabic-first AI platform with chat, persistent memory, media tooling, and a modern Next.js frontend.

## Live Site

- Production: https://alking-ai-king2-f4rr.vercel.app
- Pricing: https://alking-ai-king2-f4rr.vercel.app/pricing
- Privacy: https://alking-ai-king2-f4rr.vercel.app/privacy
- Sign in: https://alking-ai-king2-f4rr.vercel.app/auth/signin

## Project Structure

```text
.
├── app.py                    # Legacy Python backend
├── frontend/                 # Static legacy frontend
├── next-frontend/            # Next.js 14 App Router frontend
├── skills/                   # Python assistant skills
├── templates/                # Legacy backend templates
└── Alking_Memory/            # Local memory data
```

## Next.js Frontend

```bash
cd next-frontend
npm install
npm run dev
```

Open http://localhost:3000.

Production build:

```bash
npm run build
npm run start
```

## Required Environment Variables

Set these in Vercel for the `next-frontend` deployment:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_URL="https://alking-ai-king2-f4rr.vercel.app"
NEXTAUTH_SECRET="replace-with-a-strong-random-secret"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

GOOGLE_AI_API_KEY=""
GROQ_API_KEY=""
ZAI_API_KEY=""
```

For credentials login and registration, `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` are required.

## Authentication Notes

The app uses NextAuth with:

- Email/password credentials
- Google OAuth
- GitHub OAuth
- Prisma adapter backed by PostgreSQL

Recent auth fixes include:

- `/auth/signup` is included in the production build.
- `/auth/signin` handles query params correctly with Suspense.
- `/api/auth/[...nextauth]` is dynamic for Vercel runtime auth.
- Registration normalizes email addresses and stores active user profile data.
- `/terms` exists so the login and signup footer links no longer return 404.

## Legacy Frontend (UI Redesign - v2.0)

The legacy frontend has been completely redesigned with a professional, modern UI comparable to ChatGPT/Claude level quality.

### What's New in v2.0

#### Visual Design
- **Glassmorphism** throughout the interface with backdrop blur effects
- **Professional shadows** with layered depth
- **Consistent border radius** (12px-20px)
- **Royal gold color scheme** (#d4af37) with dark navy background (#0a0e1a)
- **9 custom animations**: float, fadeIn, slideUp, bounceDot, shimmer, pulseGlow, goldenPulse, shimmerText, modalSlideUp

#### Sidebar Improvements
- **Narrower width** (260px, collapsible to 64px)
- **Chat search** - filter conversations by title
- **Favorites section** - pin important chats (saved in localStorage)
- **Glass effect** background with subtle borders
- **Smooth hover effects** with gold accent

#### Chat Interface
- **Larger chat area** (max-width 800px centered)
- **Modern message bubbles** with glass effect
- **User messages**: gold gradient background
- **AI messages**: subtle glass background
- **Typing indicator** with animated bouncing dots
- **Streaming animation** for responses

#### Input Area (Modern)
- **Floating container** at bottom with 20px border radius
- **Model Selector** - choose between KING2 AI, Groq, Gemini, OpenRouter
- **Attach Button** - upload images for analysis
- **Voice Button** - Web Speech API support (Arabic)
- **Stop Generation Button** - abort ongoing responses
- **Auto-growing textarea** with focus glow effect

#### Welcome Screen
- **Animated logo** with floating effect
- **Professional title** with gradient text
- **6 Quick Action Cards**:
  - اكتب مقالاً (Write article)
  - أنشئ كود (Create code)
  - حل مشكلة برمجية (Solve programming problem)
  - لخص ملف (Summarize file)
  - أنشئ صورة (Create image)
  - ابحث في الإنترنت (Search internet)

#### User Experience
- **Loading skeletons** while waiting for responses
- **Toast notifications** with glassmorphism
- **Theme toggle** (Dark/Light mode)
- **Keyboard shortcuts**: Ctrl+K (search), Ctrl+Shift+N (new chat), Esc (close)
- **Auto-save draft** - messages saved as you type
- **Chat search** - find conversations quickly

#### Responsive Design
- **Mobile** (< 768px): Sidebar overlay, full-width input
- **Tablet** (768-1024px): Collapsible sidebar
- **Desktop** (> 1024px): Full sidebar

#### Accessibility
- ARIA attributes on all interactive elements
- `role` attributes for screen readers
- `aria-label` and `aria-live` for dynamic content
- Keyboard navigation support

### Running the Legacy Frontend

```bash
cd frontend
# Open index.html in a browser
# Or use a local server:
python -m http.server 8080
```

## Legacy Python Backend

```bash
pip install -r requirements.txt
python app.py
```

The legacy backend is separate from the Vercel-hosted Next.js frontend.

## Deployment

The current production frontend is deployed on Vercel. After pushing changes to GitHub, redeploy the Vercel project and confirm:

- `/auth/signin` loads
- `/auth/signup` loads
- `/terms` loads
- credentials registration can create a user
- credentials login can open the app after registration

## Changelog

### v2.0 (2026-06-02)
- Complete UI redesign of legacy frontend
- Added glassmorphism effects throughout
- Added model selector (KING2, Groq, Gemini, OpenRouter)
- Added voice input support (Web Speech API)
- Added stop generation button
- Added chat search and favorites
- Added loading skeletons and streaming animations
- Added theme toggle (dark/light)
- Added keyboard shortcuts
- Added auto-save draft feature
- Improved responsive design for all screen sizes
- Improved accessibility with ARIA attributes

### v1.0 (2026-05-28)
- Initial release
- Basic chat interface
- Image analysis support
- TTS support
- Admin settings dashboard

## License

MIT
