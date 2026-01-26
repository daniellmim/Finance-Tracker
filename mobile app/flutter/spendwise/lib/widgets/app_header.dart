import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/app_state.dart';
import 'category_dialog.dart';

class SpendwiseAppHeader extends StatelessWidget {
  const SpendwiseAppHeader({
    super.key,
    required this.title,
    this.showExport = false,
    this.showSettings = false,
    this.onSettings,
  });

  final String title;
  final bool showExport;
  final bool showSettings;
  final VoidCallback? onSettings;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.account_balance, color: Color(0xFF8FBC8F)),
        const SizedBox(width: 8),
        Text(
          title,
          style: Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
        ),
        const Spacer(),
        IconButton(
          tooltip: 'Manage categories',
          onPressed: () => showCategoryManager(context),
          icon: const Icon(Icons.sell_outlined),
        ),
        if (showSettings)
          IconButton(
            tooltip: 'Planner settings',
            onPressed: onSettings,
            icon: const Icon(Icons.settings_outlined),
          ),
        if (showExport)
          IconButton(
            tooltip: 'Export CSV',
            onPressed: () => context.read<AppState>().shareExpensesCsv(),
            icon: const Icon(Icons.download),
          ),
        IconButton(
          tooltip: 'Logout',
          onPressed: () => context.read<AppState>().logout(),
          icon: const Icon(Icons.logout),
        ),
      ],
    );
  }
}
