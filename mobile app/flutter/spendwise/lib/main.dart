import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'screens/auth_screen.dart';
import 'screens/dashboard_screen.dart';
import 'state/app_state.dart';
import 'theme.dart';

void main() {
  runApp(const SpendwiseApp());
}

class SpendwiseApp extends StatelessWidget {
  const SpendwiseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppState(),
      child: MaterialApp(
        title: 'SpendWise',
        theme: AppTheme.light,
        home: const RootRouter(),
      ),
    );
  }
}

class RootRouter extends StatelessWidget {
  const RootRouter({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, state, _) {
        if (!state.isReady) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (state.currentUser == null) {
          return const AuthScreen();
        }
        return const DashboardScreen();
      },
    );
  }
}
