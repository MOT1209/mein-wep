import 'package:flutter/material.dart';
import 'supabase_service.dart';
import 'game_screen.dart';

/// Home screen where players enter their name and room code
/// Players can either create a new room or join an existing one
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // Text controllers to get user input
  final _playerNameController = TextEditingController();
  final _roomCodeController = TextEditingController();

  // Instance of the Supabase service
  final _supabaseService = SupabaseService();

  // Loading state to show progress indicator
  bool _isLoading = false;

  @override
  void dispose() {
    // Clean up controllers when widget is disposed
    _playerNameController.dispose();
    _roomCodeController.dispose();
    super.dispose();
  }

  /// Validate that player name is not empty
  bool _validatePlayerName() {
    if (_playerNameController.text.trim().isEmpty) {
      _showError('Please enter your name');
      return false;
    }
    return true;
  }

  /// Show error message in a snackbar
  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  /// Show success message in a snackbar
  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
      ),
    );
  }

  /// Handle creating a new room
  /// Player becomes X and waits for player O to join
  Future<void> _createRoom() async {
    // Validate input
    if (!_validatePlayerName()) return;

    // Show loading indicator
    setState(() => _isLoading = true);

    try {
      // Create the room via Supabase service
      final roomCode = await _supabaseService.createRoom(
        _playerNameController.text.trim(),
      );

      if (roomCode != null) {
        // Room created successfully
        _showSuccess('Room created: $roomCode');

        // Navigate to game screen
        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (context) => GameScreen(
                roomCode: roomCode,
                playerName: _playerNameController.text.trim(),
                playerRole: 'X', // Creator is always X
              ),
            ),
          );
        }
      } else {
        _showError('Failed to create room');
      }
    } finally {
      // Hide loading indicator
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  /// Handle joining an existing room
  /// Player becomes O
  Future<void> _joinRoom() async {
    // Validate inputs
    if (!_validatePlayerName()) return;

    if (_roomCodeController.text.trim().isEmpty) {
      _showError('Please enter a room code');
      return;
    }

    // Show loading indicator
    setState(() => _isLoading = true);

    try {
      // Join the room via Supabase service
      final success = await _supabaseService.joinRoom(
        _roomCodeController.text.trim().toUpperCase(),
        _playerNameController.text.trim(),
      );

      if (success) {
        // Joined successfully
        _showSuccess('Joined room successfully');

        // Navigate to game screen
        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (context) => GameScreen(
                roomCode: _roomCodeController.text.trim().toUpperCase(),
                playerName: _playerNameController.text.trim(),
                playerRole: 'O', // Joiner is always O
              ),
            ),
          );
        }
      } else {
        _showError('Failed to join room. Check the room code.');
      }
    } finally {
      // Hide loading indicator
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // App bar with title
      appBar: AppBar(
        title: const Text('Room Tic Tac Toe'),
        centerTitle: true,
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // App icon/logo
              Icon(
                Icons.grid_3x3,
                size: 100,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 32),

              // Title
              Text(
                'Play Tic Tac Toe Online',
                style: Theme.of(context).textTheme.headlineMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),

              // Subtitle
              Text(
                'Enter your name and create or join a room',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              // Player name text field
              TextField(
                controller: _playerNameController,
                decoration: const InputDecoration(
                  labelText: 'Your Name',
                  hintText: 'Enter your name',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person),
                ),
                enabled: !_isLoading,
              ),
              const SizedBox(height: 16),

              // Room code text field (for joining)
              TextField(
                controller: _roomCodeController,
                decoration: const InputDecoration(
                  labelText: 'Room Code (to join)',
                  hintText: 'Enter room code',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.meeting_room),
                ),
                textCapitalization: TextCapitalization.characters,
                enabled: !_isLoading,
              ),
              const SizedBox(height: 24),

              // Create room button
              FilledButton.icon(
                onPressed: _isLoading ? null : _createRoom,
                icon: const Icon(Icons.add),
                label: const Text('Create New Room'),
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                ),
              ),
              const SizedBox(height: 12),

              // Join room button
              FilledButton.tonalIcon(
                onPressed: _isLoading ? null : _joinRoom,
                icon: const Icon(Icons.login),
                label: const Text('Join Existing Room'),
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                ),
              ),

              // Loading indicator
              if (_isLoading) ...[
                const SizedBox(height: 24),
                const Center(
                  child: CircularProgressIndicator(),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
