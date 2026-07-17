import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'features/reels/presentation/reels_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://vkwghdcvtpkhoiaxqppq.supabase.co',
    anonKey: 'sb_publishable_vXURLFgB4gttgVe6PGymHw_NJJ88mBs',
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rels AI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.teal,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        fontFamily:
            'Cairo', // Default Arabic Font (requires addition to fonts later)
      ),
      home: const ReelsPage(),
    );
  }
}
