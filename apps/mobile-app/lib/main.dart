import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'services/auth_service.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<AuthService>(
      create: (_) => AuthService(),
      child: MaterialApp(
        title: 'The DABBA Company',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          primaryColor: const Color(0xFFF97316), // Orange 500
          scaffoldBackgroundColor: const Color(0xFF020617), // Slate 950
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFF97316),
            secondary: Color(0xFFEA580C),
            surface: Color(0xFF0F172A),
            onPrimary: Colors.white,
            onSecondary: Colors.white,
            onSurface: Colors.white,
          ),
          textTheme: GoogleFonts.interTextTheme(
            ThemeData.dark().textTheme,
          ).copyWith(
            displayLarge: GoogleFonts.outfit(
              textStyle: ThemeData.dark().textTheme.displayLarge,
            ),
            displayMedium: GoogleFonts.outfit(
              textStyle: ThemeData.dark().textTheme.displayMedium,
            ),
            displaySmall: GoogleFonts.outfit(
              textStyle: ThemeData.dark().textTheme.displaySmall,
            ),
            headlineLarge: GoogleFonts.outfit(
              textStyle: ThemeData.dark().textTheme.headlineLarge,
            ),
            headlineMedium: GoogleFonts.outfit(
              textStyle: ThemeData.dark().textTheme.headlineMedium,
            ),
            headlineSmall: GoogleFonts.outfit(
              textStyle: ThemeData.dark().textTheme.headlineSmall,
            ),
            titleLarge: GoogleFonts.outfit(
              textStyle: ThemeData.dark().textTheme.titleLarge,
            ),
            titleMedium: GoogleFonts.outfit(
              textStyle: ThemeData.dark().textTheme.titleMedium,
            ),
            titleSmall: GoogleFonts.outfit(
              textStyle: ThemeData.dark().textTheme.titleSmall,
            ),
          ),
          cardTheme: CardThemeData(
            color: const Color(0xFF0F172A),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Colors.white10),
            ),
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF0F172A),
            elevation: 0,
            iconTheme: IconThemeData(color: Colors.white),
            titleTextStyle: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        home: const AuthWrapper(),
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);

    // Show splash screen while checking auth status
    if (!authService.isInitialized) {
      return const SplashScreen();
    }

    // Route to Home if authenticated, else Login
    if (authService.isAuthenticated) {
      return const HomeScreen();
    } else {
      return const LoginScreen();
    }
  }
}
