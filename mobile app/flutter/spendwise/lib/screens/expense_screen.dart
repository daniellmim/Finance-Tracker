import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../backend/suggestions.dart';
import '../models/models.dart';
import '../state/app_state.dart';
import '../widgets/app_header.dart';

class ExpenseScreen extends StatefulWidget {
  const ExpenseScreen({super.key});

  @override
  State<ExpenseScreen> createState() => _ExpenseScreenState();
}

class _ExpenseScreenState extends State<ExpenseScreen> {
  final _descriptionController = TextEditingController();
  final _amountController = TextEditingController();
  DateTime _selectedDate = DateTime.now();
  String? _selectedCategory;
  DateTimeRange? _dateRange;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _dateRange = DateTimeRange(
      start: DateTime(now.year, now.month, 1),
      end: now,
    );
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _pickRange() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(now.year - 3),
      lastDate: now,
      initialDateRange: _dateRange,
    );
    if (picked != null) {
      setState(() => _dateRange = picked);
    }
  }

  void _suggestCategory(List<String> categories) {
    final suggestion = suggestCategory(_descriptionController.text, categories);
    setState(() => _selectedCategory = suggestion);
  }

  Future<void> _submit(List<String> categories) async {
    final description = _descriptionController.text.trim();
    final amount = double.tryParse(_amountController.text.trim());
    if (description.length < 2 || amount == null || amount <= 0) {
      return;
    }
    final category =
        _selectedCategory ??
        (categories.isNotEmpty ? categories.first : 'General');
    final expense = Expense.create(
      description: description,
      amount: amount,
      category: category,
      date: _selectedDate,
    );
    await context.read<AppState>().addExpense(expense);
    _descriptionController.clear();
    _amountController.clear();
    setState(() {
      _selectedDate = DateTime.now();
      _selectedCategory = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final formatter = DateFormat('MMM d, yyyy');
    return Consumer<AppState>(
      builder: (context, state, _) {
        final range = _dateRange;
        final filtered = state.expenses.where((expense) {
          if (range == null) return true;
          return !expense.date.isBefore(range.start) &&
              !expense.date.isAfter(range.end);
        }).toList();

        return SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SpendwiseAppHeader(title: 'SpendWise', showExport: true),
              const SizedBox(height: 20),
              Row(
                children: [
                  Text(
                    'Expense Tracker',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const Spacer(),
                  OutlinedButton.icon(
                    onPressed: _pickRange,
                    icon: const Icon(Icons.date_range),
                    label: Text(
                      range == null
                          ? 'Pick date range'
                          : '${DateFormat('MMM d').format(range.start)} - ${DateFormat('MMM d').format(range.end)}',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 16,
                runSpacing: 16,
                children: [
                  SizedBox(
                    width: 380,
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Add New Expense',
                              style: Theme.of(context).textTheme.titleMedium
                                  ?.copyWith(fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 16),
                            TextField(
                              controller: _descriptionController,
                              decoration: const InputDecoration(
                                labelText: 'Description',
                              ),
                            ),
                            const SizedBox(height: 12),
                            TextField(
                              controller: _amountController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'Amount',
                              ),
                            ),
                            const SizedBox(height: 12),
                            DropdownButtonFormField<String>(
                              value: _selectedCategory,
                              items: state.categories
                                  .map(
                                    (cat) => DropdownMenuItem(
                                      value: cat,
                                      child: Text(cat),
                                    ),
                                  )
                                  .toList(),
                              onChanged: (value) =>
                                  setState(() => _selectedCategory = value),
                              decoration: const InputDecoration(
                                labelText: 'Category',
                              ),
                            ),
                            const SizedBox(height: 12),
                            OutlinedButton.icon(
                              onPressed: _pickDate,
                              icon: const Icon(Icons.event),
                              label: Text(formatter.format(_selectedDate)),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                OutlinedButton.icon(
                                  onPressed: () =>
                                      _suggestCategory(state.categories),
                                  icon: const Icon(Icons.lightbulb_outline),
                                  label: const Text('Suggest Category'),
                                ),
                                const Spacer(),
                                FilledButton(
                                  onPressed: () => _submit(state.categories),
                                  child: const Text('Add Expense'),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 380,
                    child: _SpendingOverview(expenses: filtered),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Recent Expenses',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 12),
                      if (filtered.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 16),
                          child: Text(
                            'No expenses found for the selected period.',
                          ),
                        )
                      else
                        ...filtered.map(
                          (expense) => ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(
                              expense.description,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            subtitle: Text(
                              '${expense.category} - ${formatter.format(expense.date)}',
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text('\$${expense.amount.toStringAsFixed(2)}'),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline),
                                  onPressed: () =>
                                      state.deleteExpense(expense.id),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SpendingOverview extends StatelessWidget {
  const _SpendingOverview({required this.expenses});

  final List<Expense> expenses;

  @override
  Widget build(BuildContext context) {
    final totals = <String, double>{};
    for (final expense in expenses) {
      totals.update(
        expense.category,
        (value) => value + expense.amount,
        ifAbsent: () => expense.amount,
      );
    }
    final sorted = totals.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    final totalSpending = totals.values.fold<double>(
      0,
      (sum, value) => sum + value,
    );

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Spending Overview',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 4),
            Text('Total: \$${totalSpending.toStringAsFixed(2)}'),
            const SizedBox(height: 16),
            SizedBox(
              height: 220,
              child: sorted.isEmpty
                  ? const Center(
                      child: Text('No spending data for this period.'),
                    )
                  : BarChart(
                      BarChartData(
                        titlesData: FlTitlesData(
                          topTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          rightTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          leftTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              reservedSize: 36,
                              getTitlesWidget: (value, meta) =>
                                  Text('\$${value.toInt()}'),
                            ),
                          ),
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                final index = value.toInt();
                                if (index < 0 || index >= sorted.length)
                                  return const SizedBox.shrink();
                                final label = sorted[index].key;
                                return Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: Text(
                                    label.length > 6
                                        ? label.substring(0, 6)
                                        : label,
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                        gridData: const FlGridData(show: false),
                        borderData: FlBorderData(show: false),
                        barGroups: List.generate(sorted.length, (index) {
                          final entry = sorted[index];
                          return BarChartGroupData(
                            x: index,
                            barRods: [
                              BarChartRodData(
                                toY: entry.value,
                                width: 16,
                                borderRadius: BorderRadius.circular(6),
                                color: const Color(0xFF70A1A1),
                              ),
                            ],
                          );
                        }),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
