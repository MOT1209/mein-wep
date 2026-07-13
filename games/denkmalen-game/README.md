# 🎨 Draw Battle

A modern multiplayer drawing game with offline and online modes. Draw, vote, and win!

## ✨ Features

### Game Modes
- **Offline Mode**: Play with friends on a single device (2-8 players)
- **Online Mode**: Real-time multiplayer across different devices

### Drawing System
- Multiple tools: Pencil, Brush, Marker, Eraser, Bucket Fill
- Color picker with 30+ colors
- Adjustable brush sizes
- Undo/Redo functionality
- Smooth 60 FPS canvas

### Voting System
- Anonymous voting
- Can't vote for your own drawing
- Fair score calculation

### Progression
- Achievements system
- Statistics tracking
- Unlockable items

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Online Multiplayer Server

```bash
# Start with Socket.IO server
node server.js
```

## 🎮 How to Play

### Offline Mode
1. Select "Offline Mode" from the main menu
2. Enter player names (2-8 players)
3. Choose settings (rounds, time, category)
4. Pass the device between players
5. Each player draws the given word
6. Vote for the best drawing
7. See results and leaderboard

### Online Mode
1. Select "Online Mode"
2. Host creates a room (shares code/QR)
3. Players join with room code
4. Host starts the game
5. Everyone draws simultaneously
6. Vote and see results

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **State**: Zustand
- **Real-time**: Socket.IO
- **Database**: Supabase (optional)
- **Offline Storage**: LocalStorage

## 📁 Project Structure

```
draw-battle/
├── src/
│   ├── app/           # Next.js pages
│   ├── components/    # React components
│   └── store/         # Zustand store
├── public/            # Static assets
├── server.js          # Socket.IO server
└── package.json
```

## 🎨 Customization

### Categories
- Food 🍔
- Animals 🐱
- Nature 🌸
- Objects 💡
- Vehicles 🚗
- Sports ⚽
- Jobs 👨‍🍳
- Fantasy 🧙
- Random 🎲

### Settings
- Dark/Light mode
- Sound effects
- Background music
- Vibration
- Language (English/Arabic)

## 📱 Mobile Support

Fully responsive and optimized for mobile devices with:
- Touch drawing
- Gesture support
- PWA capabilities

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project!

## 🎯 Roadmap

- [ ] Supabase integration
- [ ] Google/Apple sign-in
- [ ] Custom categories
- [ ] Friend system
- [ ] Tournaments
- [ ] Daily challenges
- [ ] Drawing replay
- [ ] Sound effects library

---

Made with ❤️ for creative minds
