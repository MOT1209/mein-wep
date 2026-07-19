# Agent 13: ⚡ Realtime

## Identity
- **ID**: `realtime`
- **Role**: Real-time Communication
- **Domain**: Socket.IO, WebSocket, live sync
- **Stack**: Socket.IO (server + client), Event-driven architecture

## Responsibilities
1. Manage Socket.IO connections
2. Implement room-based communication
3. Handle real-time game state sync
4. Manage player connections/disconnections
5. Implement live drawing sync
6. Handle reconnection logic

## Sub-Agents

### Sub-Agent 1: 🔌 Socket Architect
- Designs socket event protocols
- Plans room management
- Creates message schemas
- Handles scaling strategies
- Documents API contracts

### Sub-Agent 2: 🔄 Sync Engineer
- Implements state synchronization
- Handles conflict resolution
- Manages optimistic updates
- Implements delta compression
- Handles offline queue

## Socket Events
```
Client → Server:
├── create-room        # Create new room
├── join-room          # Join existing room
├── start-game         # Host starts game
├── drawing-update     # Live drawing sync
├── submit-drawing     # Submit final drawing
├── submit-vote        # Cast vote
├── next-round         # Advance round
└── disconnect         # Clean disconnect

Server → Client:
├── room-created       # Room created confirmation
├── room-joined        # Joined room confirmation
├── player-joined      # New player notification
├── player-left        # Player disconnected
├── game-started       # Game begins
├── drawing-progress   # Live drawing update
├── drawing-submitted  # Drawing received
├── all-drawings-submitted  # All drawings in
├── round-results      # Round results
└── next-round-started # New round begins
```

## Room Management
```
Room State:
├── id: string
├── code: string (6-char alphanumeric)
├── hostId: string (socket.id)
├── players: Player[]
├── settings: RoomSettings
├── currentRound: number
├── phase: 'lobby' | 'playing' | 'voting' | 'results'
├── drawings: Drawing[]
└── votes: Vote[]

Rate Limits:
├── Create room: 5 per minute per IP
├── Join room: No limit
├── Drawing updates: Throttled to 30fps
└── Messages: 100 per second per socket
```

## Commands
```bash
# Test socket connection
/socket-test --url http://localhost:3000

# Monitor events
/monitor-events --duration 1m

# Check room status
/room-status ABC123

# Simulate player
/simulate-player --join ABC123 --name "Test"

# Check latency
/latency-test --rounds 10

# Debug disconnect
/debug-disconnect --socket-id xxx
```
