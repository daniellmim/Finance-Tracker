import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/app_state.dart';

Future<void> showCategoryManager(BuildContext context) async {
  final controller = TextEditingController();
  return showDialog(
    context: context,
    builder: (context) {
      return AlertDialog(
        title: const Text('Manage Categories'),
        content: SizedBox(
          width: 360,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Consumer<AppState>(
                builder: (_, state, __) => Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: state.categories
                      .map((cat) => Chip(label: Text(cat)))
                      .toList(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: controller,
                decoration: const InputDecoration(labelText: 'New category'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
          FilledButton(
            onPressed: () {
              final name = controller.text.trim();
              if (name.isNotEmpty) {
                context.read<AppState>().addCategory(name);
              }
              Navigator.of(context).pop();
            },
            child: const Text('Add'),
          ),
        ],
      );
    },
  );
}
