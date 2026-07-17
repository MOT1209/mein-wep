import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:math';

/// Service class that handles all communication with Supabase
/// This class provides methods to create rooms, join rooms, make moves,
/// and subscribe to real-time updates
class SupabaseService {
  // Get the Supabase client instance
  final SupabaseClient _client = Supabase.instance.client;

  /// Generate a random 6-character room code
  /// Uses uppercase letters and numbers for easy sharing
  String generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    final random = Random();
    return List.generate(6, (index) => chars[random.nextInt(chars.length)])
        .join();
  }

  /// Create a new room with the given player name
  /// The creator becomes player X
  /// Returns the room code on success, or null on failure
  Future<String?> createRoom(String playerName) async {
    try {
      // Generate a unique room code
      final code = generateRoomCode();

      // Insert a new room into the database
      // Initial board is 9 dots (empty)
      // Status is 'waiting' for the second player
      // Current turn is X (but game won't start until player O joins)
      await _client.from('rooms').insert({
        'code': code,
        'player_x_name': playerName,
        'player_o_name': null,
        'board': '.........',  // 9 empty cells
        'current_turn': 'X',
        'status': 'waiting',
        'winner': null,
      });

      return code;
    } catch (e) {
      print('Error creating room: $e');
      return null;
    }
  }

  /// Join an existing room with the given room code
  /// The joiner becomes player O
  /// Returns true on success, false on failure
  Future<bool> joinRoom(String roomCode, String playerName) async {
    try {
      // First, check if the room exists and is waiting for a player
      final response = await _client
          .from('rooms')
          .select()
          .eq('code', roomCode)
          .maybeSingle();

      if (response == null) {
        print('Room not found');
        return false;
      }

      final room = response as Map<String, dynamic>;

      // Check if room is still waiting
      if (room['status'] != 'waiting') {
        print('Room is not available');
        return false;
      }

      // Check if player O slot is empty
      if (room['player_o_name'] != null) {
        print('Room is full');
        return false;
      }

      // Update the room with player O name and change status to playing
      await _client.from('rooms').update({
        'player_o_name': playerName,
        'status': 'playing',
      }).eq('code', roomCode);

      return true;
    } catch (e) {
      print('Error joining room: $e');
      return false;
    }
  }

  /// Get room data by room code
  /// Returns the room data or null if not found
  Future<Map<String, dynamic>?> getRoom(String roomCode) async {
    try {
      final response = await _client
          .from('rooms')
          .select()
          .eq('code', roomCode)
          .maybeSingle();

      return response as Map<String, dynamic>?;
    } catch (e) {
      print('Error getting room: $e');
      return null;
    }
  }

  /// Subscribe to real-time updates for a specific room
  /// Returns a stream of room data that updates whenever the room changes
  Stream<Map<String, dynamic>> subscribeToRoom(String roomCode) {
    return _client
        .from('rooms')
        .stream(primaryKey: ['id'])
        .eq('code', roomCode)
        .map((list) => list.isNotEmpty ? list.first : <String, dynamic>{});
  }

  /// Make a move on the board
  /// Updates the board, checks for win/draw, and switches turns
  Future<bool> makeMove(String roomCode, int position, String player) async {
    try {
      // Get current room state
      final room = await getRoom(roomCode);
      if (room == null) return false;

      // Validate the move
      final board = room['board'] as String;
      final currentTurn = room['status'] == 'playing' ? room['current_turn'] : null;

      // Check if it's this player's turn
      if (currentTurn != player) {
        print('Not your turn');
        return false;
      }

      // Check if the position is empty
      if (board[position] != '.') {
        print('Position already taken');
        return false;
      }

      // Make the move
      final newBoard = board.substring(0, position) + 
                       player + 
                       board.substring(position + 1);

      // Check for winner or draw
      final winner = _checkWinner(newBoard);
      final isDraw = !newBoard.contains('.') && winner == null;

      // Prepare update data
      final updateData = <String, dynamic>{
        'board': newBoard,
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (winner != null) {
        // Someone won
        updateData['status'] = 'finished';
        updateData['winner'] = winner;
      } else if (isDraw) {
        // It's a draw
        updateData['status'] = 'finished';
        updateData['winner'] = 'draw';
      } else {
        // Game continues, switch turns
        updateData['current_turn'] = player == 'X' ? 'O' : 'X';
      }

      // Update the room
      await _client.from('rooms').update(updateData).eq('code', roomCode);

      return true;
    } catch (e) {
      print('Error making move: $e');
      return false;
    }
  }

  /// Check if there's a winner on the board
  /// Returns 'X', 'O', or null if no winner
  String? _checkWinner(String board) {
    // All possible winning combinations (indices)
    const winPatterns = [
      [0, 1, 2], // Top row
      [3, 4, 5], // Middle row
      [6, 7, 8], // Bottom row
      [0, 3, 6], // Left column
      [1, 4, 7], // Middle column
      [2, 5, 8], // Right column
      [0, 4, 8], // Diagonal top-left to bottom-right
      [2, 4, 6], // Diagonal top-right to bottom-left
    ];

    // Check each winning pattern
    for (final pattern in winPatterns) {
      final a = board[pattern[0]];
      final b = board[pattern[1]];
      final c = board[pattern[2]];

      // If all three positions have the same non-empty value, we have a winner
      if (a != '.' && a == b && b == c) {
        return a;
      }
    }

    return null;
  }
}
