import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'env.dart';
import 'home_screen.dart';

/// Main entry point of the application
/// Initializes Supabase and runs the app
Future<void> main() async {
  // Ensure Flutter is initialized before calling Supabase
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase with the configuration from env.dart
  // This connects the app to the Supabase backend
  await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);

  // Run the app
  runApp(const MyApp());
}

/// Root widget of the application
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      // App title
      title: 'Room Tic Tac Toe',

      // Use Material 3 design
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),

      // Dark theme
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),

      // Use system theme mode (light/dark)
      themeMode: ThemeMode.system,

      // Set home screen as the initial route
      home: const HomeScreen(),

      // Remove debug banner
      debugShowCheckedModeBanner: false,
    );
  }
}
