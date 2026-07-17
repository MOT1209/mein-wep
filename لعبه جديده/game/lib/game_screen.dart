import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'supabase_service.dart';

/// Game screen where the tic tac toe game is played
/// Shows the board, player names, current turn, and game result
/// Updates in real-time using Supabase realtime subscriptions
class GameScreen extends StatefulWidget {
  final String roomCode;
  final String playerName;
  final String playerRole; // 'X' or 'O'

  const GameScreen({
    super.key,
    required this.roomCode,
    required this.playerName,
    required this.playerRole,
  });

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  // Instance of the Supabase service
  final _supabaseService = SupabaseService();

  // Subscription to room updates
  StreamSubscription? _roomSubscription;

  // Current room data
  Map<String, dynamic>? _roomData;

  // Loading state
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeGame();
  }

  @override
  void dispose() {
    // Cancel subscription when screen is disposed
    _roomSubscription?.cancel();
    super.dispose();
  }

  /// Initialize the game by loading room data and subscribing to updates
  Future<void> _initializeGame() async {
    // Get initial room data
    final roomData = await _supabaseService.getRoom(widget.roomCode);

    if (roomData != null) {
      setState(() {
        _roomData = roomData;
        _isLoading = false;
      });

      // Subscribe to real-time updates
      _roomSubscription = _supabaseService
          .subscribeToRoom(widget.roomCode)
          .listen((data) {
        if (mounted) {
          setState(() {
            _roomData = data;
          });
        }
      });
    } else {
      // Room not found
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Room not found'),
            backgroundColor: Colors.red,
          ),
        );
        Navigator.of(context).pop();
      }
    }
  }

  /// Handle a player's move on the board
  Future<void> _makeMove(int position) async {
    // Don't allow moves if game is not playing
    if (_roomData?['status'] != 'playing') return;

    // Don't allow moves if it's not this player's turn
    if (_roomData?['current_turn'] != widget.playerRole) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Not your turn!'),
          duration: Duration(seconds: 1),
        ),
      );
      return;
    }

    // Make the move via Supabase service
    final success = await _supabaseService.makeMove(
      widget.roomCode,
      position,
      widget.playerRole,
    );

    if (!success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invalid move'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  /// Copy room code to clipboard
  void _copyRoomCode() {
    Clipboard.setData(ClipboardData(text: widget.roomCode));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Room code copied to clipboard'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  /// Get status message based on game state
  String _getStatusMessage() {
    if (_roomData == null) return '';

    final status = _roomData!['status'];

    if (status == 'waiting') {
      return 'Waiting for player O to join...';
    } else if (status == 'finished') {
      final winner = _roomData!['winner'];
      if (winner == 'draw') {
        return 'Game Over - Draw!';
      } else if (winner == widget.playerRole) {
        return 'You Win! 🎉';
      } else {
        return 'You Lose!';
      }
    } else {
      // Game is playing
      final currentTurn = _roomData!['current_turn'];
      if (currentTurn == widget.playerRole) {
        return 'Your turn';
      } else {
        return 'Opponent\'s turn';
      }
    }
  }

  /// Get color for status message
  Color _getStatusColor() {
    if (_roomData == null) return Colors.grey;

    final status = _roomData!['status'];

    if (status == 'waiting') {
      return Colors.orange;
    } else if (status == 'finished') {
      final winner = _roomData!['winner'];
      if (winner == 'draw') {
        return Colors.blue;
      } else if (winner == widget.playerRole) {
        return Colors.green;
      } else {
        return Colors.red;
      }
    } else {
      final currentTurn = _roomData!['current_turn'];
      if (currentTurn == widget.playerRole) {
        return Colors.green;
      } else {
        return Colors.orange;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    final playerXName = _roomData?['player_x_name'] ?? 'Waiting...';
    final playerOName = _roomData?['player_o_name'] ?? 'Waiting...';
    final board = _roomData?['board'] ?? '.........';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tic Tac Toe'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          // Button to copy room code
          IconButton(
            icon: const Icon(Icons.copy),
            onPressed: _copyRoomCode,
            tooltip: 'Copy room code',
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Room code display
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.meeting_room),
                      const SizedBox(width: 8),
                      Text(
                        'Room: ${widget.roomCode}',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.copy, size: 20),
                        onPressed: _copyRoomCode,
                        tooltip: 'Copy',
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Player names
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  // Player X
                  Expanded(
                    child: Card(
                      color: widget.playerRole == 'X'
                          ? Theme.of(context).colorScheme.primaryContainer
                          : null,
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Column(
                          children: [
                            Text(
                              'Player X',
                              style: Theme.of(context).textTheme.labelSmall,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              playerXName,
                              style: Theme.of(context).textTheme.titleMedium,
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (widget.playerRole == 'X')
                              const Text(
                                '(You)',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // VS divider
                  const Text(
                    'VS',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Player O
                  Expanded(
                    child: Card(
                      color: widget.playerRole == 'O'
                          ? Theme.of(context).colorScheme.primaryContainer
                          : null,
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Column(
                          children: [
                            Text(
                              'Player O',
                              style: Theme.of(context).textTheme.labelSmall,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              playerOName,
                              style: Theme.of(context).textTheme.titleMedium,
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (widget.playerRole == 'O')
                              const Text(
                                '(You)',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Status message
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _getStatusColor().withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: _getStatusColor(),
                    width: 2,
                  ),
                ),
                child: Text(
                  _getStatusMessage(),
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: _getStatusColor(),
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 24),

              // Tic Tac Toe Board
              Expanded(
                child: Center(
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        crossAxisSpacing: 8,
                        mainAxisSpacing: 8,
                      ),
                      itemCount: 9,
                      itemBuilder: (context, index) {
                        final cell = board[index];
                        return _buildCell(cell, index);
                      },
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Back to home button (only show when game is finished)
              if (_roomData?['status'] == 'finished')
                FilledButton.icon(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.home),
                  label: const Text('Back to Home'),
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  /// Build a single cell of the tic tac toe board
  Widget _buildCell(String value, int index) {
    // Determine what to show in the cell
    String displayText = '';
    Color? textColor;

    if (value == 'X') {
      displayText = 'X';
      textColor = Colors.blue;
    } else if (value == 'O') {
      displayText = 'O';
      textColor = Colors.red;
    }

    return Material(
      color: value == '.'
          ? Theme.of(context).colorScheme.surfaceContainerHighest
          : Theme.of(context).colorScheme.surface,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: value == '.' ? () => _makeMove(index) : null,
        child: Center(
          child: Text(
            displayText,
            style: TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
        ),
      ),
    );
  }
}
