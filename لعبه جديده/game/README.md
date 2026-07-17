# Room Tic Tac Toe Online

A Flutter app that lets two players play Tic Tac Toe online by joining the same room code. Built with Flutter and Supabase for real-time gameplay.

## Features

- **No Authentication Required**: Just enter your name and start playing
- **Room-Based Multiplayer**: Create or join rooms using simple room codes
- **Real-Time Synchronization**: Moves sync instantly between players using Supabase Realtime
- **Material 3 Design**: Modern, clean UI with light and dark theme support
- **Simple and Beginner-Friendly**: Clean code with extensive comments

## How to Play

1. **Create a Room**:
   - Enter your name
   - Click "Create New Room"
   - Share the room code with your opponent

2. **Join a Room**:
   - Enter your name
   - Enter the room code
   - Click "Join Existing Room"

3. **Play**:
   - Player X (room creator) goes first
   - Players take turns clicking empty cells
   - First to get three in a row wins!

## Setup Instructions

### Prerequisites

- Flutter SDK (3.10.4 or higher)
- A Supabase account (free tier is fine)

### Supabase Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project

2. **Set Up the Database**:
   - Open the SQL Editor in your Supabase dashboard
   - Copy the entire contents of `supabase_schema.sql`
   - Paste and run it in the SQL Editor
   - This creates the `rooms` table with proper security policies

3. **Get Your Credentials**:
   - Go to Project Settings > API
   - Copy your Project URL
   - Copy your anon/public key

4. **Configuration** (Already Done):
   - The credentials have already been configured in `lib/env.dart`
   - No need to edit any files!

### Running the App

1. **Install Dependencies**:
   ```bash
   flutter pub get
   ```

2. **Run the App**:
   ```bash
   flutter run
   ```

   Or choose a specific device:
   ```bash
   flutter run -d windows
   flutter run -d chrome
   flutter run -d android
   ```

## Project Structure

```
lib/
├── main.dart              # App entry point, Supabase initialization
├── env.dart               # Supabase configuration (URL and API key)
├── supabase_service.dart  # Backend service class
├── home_screen.dart       # Home screen UI
└── game_screen.dart       # Game screen UI

supabase_schema.sql        # Database schema for Supabase
```

## Technical Details

### Stack

- **Frontend**: Flutter with Material 3
- **Backend**: Supabase (PostgreSQL + Realtime)
- **State Management**: Simple `setState` (beginner-friendly)
- **Real-Time**: Supabase Realtime subscriptions

### Database Schema

The `rooms` table stores all game state:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique room identifier |
| code | TEXT | Room code for joining |
| player_x_name | TEXT | Name of player X |
| player_o_name | TEXT | Name of player O |
| board | TEXT | 9-character board state |
| current_turn | TEXT | 'X' or 'O' |
| status | TEXT | 'waiting', 'playing', or 'finished' |
| winner | TEXT | 'X', 'O', 'draw', or NULL |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### How Real-Time Works

1. Players subscribe to room updates using Supabase Realtime
2. When a player makes a move, the database is updated
3. Supabase broadcasts the change to all subscribed clients
4. Both players see the update instantly

## Code Highlights

### Clean Architecture

- **Service Layer**: `SupabaseService` handles all backend logic
- **UI Layer**: Screens are purely focused on presentation
- **State Management**: Simple `setState` for easy understanding

### Extensive Comments

Every file is heavily commented to help beginners understand:
- What each function does
- Why certain decisions were made
- How the code works

### Error Handling

- Validates user input
- Shows clear error messages
- Handles network failures gracefully

## Learning Resources

This project is perfect for learning:

- Flutter basics and Material 3 UI
- Supabase integration
- Real-time database subscriptions
- Simple state management patterns
- Clean code practices

## Troubleshooting

### "Room not found" Error
- Make sure the room code is correct
- Check that the room hasn't been deleted

### Real-time Not Working
- Verify Supabase RLS policies are set up correctly
- Check that the Supabase URL and API key are correct
- Ensure you have internet connectivity

### Flutter Not Found
- Make sure Flutter SDK is installed
- Add Flutter to your system PATH
- Run `flutter doctor` to check setup

## Future Improvements

Potential features to add:
- Player rankings and statistics
- Chat between players
- Timer for each turn
- Multiple game modes (5x5, etc.)
- Rematch functionality
- Room passwords

## License

This project is for educational purposes.

## Support

For issues or questions:
1. Check the code comments for explanations
2. Review the Supabase documentation
3. Check Flutter documentation

---

Built with ❤️ using Flutter and Supabase
