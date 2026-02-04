# Game Hoster Platform

## Project Setup

This project uses **Next.js 14**, **Tailwind CSS v4**, and **Supabase**.

### 1. Installation
Because of permission limits during setup, some packages might be missing.
Please run the following command in your terminal inside this folder:

```bash
npm install lucide-react framer-motion clsx tailwind-merge @supabase/supabase-js next-themes next-intl
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Features Implemented
- **Cyberpunk / Glassmorphism Design System** (in `app/globals.css`)
- **Responsive Navbar** (in `app/components/Navbar.tsx`)
- **Landing Page** with Hero & 3D Effects (in `app/page.tsx`)
- **Fonts**: Outfit & JetBrains Mono

## Next Steps
- Create `/games` page
- Create `/dashboard` layout
- Connect Supabase for Auth
