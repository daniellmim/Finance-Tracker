import 'package:flutter/material.dart';

import 'banking_screen.dart';
import 'expense_screen.dart';
import 'planner_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _index = 0;

  final _screens = const [ExpenseScreen(), PlannerScreen(), BankingScreen()];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: _screens[_index]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.receipt_long),
            label: 'Expenses',
          ),
          NavigationDestination(icon: Icon(Icons.event_note), label: 'Planner'),
          NavigationDestination(
            icon: Icon(Icons.account_balance),
            label: 'Banking',
          ),
        ],
      ),
    );
  }
}
