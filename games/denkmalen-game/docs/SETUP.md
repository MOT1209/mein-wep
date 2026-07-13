# Draw Battle - Setup Guide

## Prerequisites

- Node.js 18+ (recommended: use nvm)
- npm or yarn
- Git

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd draw-battle
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration.

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Online Multiplayer Setup

For online multiplayer, you need to run the Socket.IO server:

```bash
npm run server
```

This will start both the Next.js app and Socket.IO server.

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Deploy automatically

### Other Platforms

```bash
npm run build
# The build output is in .next/
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | App URL for sharing | `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | - |

## Troubleshooting

### Port already in use

```bash
# Find and kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Canvas not working on mobile

Make sure you're testing on a real device, not just browser emulation.

### Sound not playing

Mobile browsers require user interaction before playing audio. Tap anywhere first.

## Development

### Project Structure

```
draw-battle/
├── src/
│   ├── app/           # Next.js pages and layouts
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── store/         # Zustand state management
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── public/            # Static assets
├── docs/              # Documentation
└── server.js          # Socket.IO server
```

### Adding New Features

1. Create component in `src/components/`
2. Add types in `src/types/`
3. Update store if needed in `src/store/`
4. Add to page in `src/app/`

### Testing

```bash
npm test
```

## Support

For issues and questions, please open an issue on GitHub.
