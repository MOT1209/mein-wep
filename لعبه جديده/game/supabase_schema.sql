-- =====================================================
-- Room Tic Tac Toe Online - Supabase Database Schema
-- =====================================================
-- 
-- This SQL file creates the database structure for the Room Tic Tac Toe Online app.
-- Paste this entire file into the Supabase SQL Editor to set up the database.
--
-- The schema includes:
-- 1. The 'rooms' table to store game state
-- 2. Row Level Security (RLS) policies for secure data access
-- 3. Indexes for performance optimization

-- =====================================================
-- 1. Create the rooms table
-- =====================================================

CREATE TABLE IF NOT EXISTS rooms (
    -- Unique identifier for each room (auto-generated)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Room code that players use to join (must be unique)
    code TEXT NOT NULL UNIQUE,
    
    -- Name of player X (the room creator)
    player_x_name TEXT,
    
    -- Name of player O (the player who joins)
    player_o_name TEXT,
    
    -- Game board represented as a 9-character string
    -- Each character is 'X', 'O', or '.' (empty)
    -- Positions: 0-2 (top row), 3-5 (middle row), 6-8 (bottom row)
    board TEXT NOT NULL DEFAULT '.........',
    
    -- Current turn: either 'X' or 'O'
    current_turn TEXT NOT NULL DEFAULT 'X',
    
    -- Game status: 'waiting' (for player O), 'playing', or 'finished'
    status TEXT NOT NULL DEFAULT 'waiting',
    
    -- Winner of the game: 'X', 'O', 'draw', or NULL if game not finished
    winner TEXT,
    
    -- Timestamp of last update (automatically updated)
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Timestamp when room was created
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints to ensure data integrity
    CONSTRAINT valid_status CHECK (status IN ('waiting', 'playing', 'finished')),
    CONSTRAINT valid_current_turn CHECK (current_turn IN ('X', 'O')),
    CONSTRAINT valid_winner CHECK (winner IS NULL OR winner IN ('X', 'O', 'draw')),
    CONSTRAINT valid_board_length CHECK (LENGTH(board) = 9)
);

-- =====================================================
-- 2. Create indexes for better query performance
-- =====================================================

-- Index on room code for fast lookups when joining
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);

-- Index on status for querying active games
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- Index on updated_at for sorting by recent activity
CREATE INDEX IF NOT EXISTS idx_rooms_updated_at ON rooms(updated_at DESC);

-- =====================================================
-- 3. Enable Row Level Security (RLS)
-- =====================================================

-- Enable RLS on the rooms table
-- This ensures that all queries must pass through security policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Create RLS Policies
-- =====================================================

-- Policy 1: Allow anyone to SELECT (read) all rooms
-- This is needed so players can:
-- - Check if a room code exists
-- - Get room data to display the game
-- - Subscribe to real-time updates
CREATE POLICY "Anyone can read rooms"
ON rooms
FOR SELECT
TO public
USING (true);

-- Policy 2: Allow anyone to INSERT (create) new rooms
-- This is needed when a player creates a new room
-- The player becomes player X
CREATE POLICY "Anyone can create rooms"
ON rooms
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 3: Allow anyone to UPDATE existing rooms
-- This is needed for:
-- - Player O joining the room (setting player_o_name)
-- - Players making moves (updating board and current_turn)
-- - Game finishing (updating status and winner)
-- 
-- Note: In a production app, you might want to restrict updates
-- to only allow valid game moves based on the current state.
-- For this learning project, we keep it simple.
CREATE POLICY "Anyone can update rooms"
ON rooms
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Policy 4: (Optional) Allow deleting old finished rooms
-- This helps keep the database clean by allowing old games to be removed
-- You could set up a scheduled function to auto-delete old rooms
CREATE POLICY "Anyone can delete old finished rooms"
ON rooms
FOR DELETE
TO public
USING (
    status = 'finished' 
    AND updated_at < NOW() - INTERVAL '24 hours'
);

-- =====================================================
-- 5. Create a function to update the updated_at timestamp
-- =====================================================

-- This function automatically updates the updated_at column
-- whenever a row is modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. Create a trigger to automatically update updated_at
-- =====================================================

-- This trigger calls the function above before any UPDATE
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Setup Complete!
-- =====================================================
-- 
-- You can now use the app to create and join rooms.
-- 
-- To verify the setup, you can run:
-- SELECT * FROM rooms;
-- 
-- To manually create a test room, you can run:
-- INSERT INTO rooms (code, player_x_name) VALUES ('TEST01', 'Alice');
