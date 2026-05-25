import 'package:flutter/material.dart';
import 'features/home/home_screen.dart';

class TiligoApp extends StatelessWidget {
  const TiligoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tiligo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.indigo,
      ),
      home: const HomeScreen(),
    );
  }
}