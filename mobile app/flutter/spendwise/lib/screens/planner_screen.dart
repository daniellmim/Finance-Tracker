import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:table_calendar/table_calendar.dart';

import '../backend/suggestions.dart';
import '../models/models.dart';
import '../state/app_state.dart';
import '../widgets/app_header.dart';

class PlannerScreen extends StatefulWidget {
  const PlannerScreen({super.key});

  @override
  State<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends State<PlannerScreen> {
  bool showCalendar = false;
  String searchTerm = '';

  Future<void> _openSettings(BuildContext context) async {
    final state = context.read<AppState>();
    final controller = TextEditingController();

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Planner Settings'),
        content: SizedBox(
          width: 360,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Categories',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: state.categories
                    .map((cat) => Chip(label: Text(cat)))
                    .toList(),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: controller,
                decoration: const InputDecoration(labelText: 'New category'),
              ),
              const SizedBox(height: 16),
              const Text(
                'Data Management',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () async {
                        final json = state.exportDataJson();
                        final dir = await getTemporaryDirectory();
                        final filename =
                            'spendwise-backup-${DateTime.now().toIso8601String().split('T').first}.json';
                        final file = File('${dir.path}/$filename');
                        await file.writeAsString(json);
                        await Share.shareXFiles([
                          XFile(file.path),
                        ], text: 'SpendWise backup');
                      },
                      child: const Text('Export'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () async {
                        final picked = await FilePicker.platform.pickFiles(
                          type: FileType.custom,
                          allowedExtensions: ['json'],
                        );
                        if (picked == null || picked.files.single.path == null)
                          return;
                        final file = File(picked.files.single.path!);
                        final content = await file.readAsString();
                        final success = await state.importDataJson(content);
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              success ? 'Import successful.' : 'Import failed.',
                            ),
                          ),
                        );
                      },
                      child: const Text('Import'),
                    ),
                  ),
                ],
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
                state.addCategory(name);
              }
              Navigator.of(context).pop();
            },
            child: const Text('Add Category'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, state, _) {
        final filteredPlans = state.plans.where((plan) {
          final lower = searchTerm.toLowerCase();
          return plan.title.toLowerCase().contains(lower) ||
              plan.category.toLowerCase().contains(lower) ||
              (plan.purpose?.toLowerCase().contains(lower) ?? false) ||
              (plan.recipient?.toLowerCase().contains(lower) ?? false);
        }).toList();

        return SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SpendwiseAppHeader(
                title: 'SpendWise',
                showSettings: true,
                onSettings: () => _openSettings(context),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      decoration: const InputDecoration(
                        labelText: 'Search plans',
                        prefixIcon: Icon(Icons.search),
                      ),
                      onChanged: (value) => setState(() => searchTerm = value),
                    ),
                  ),
                  const SizedBox(width: 12),
                  IconButton(
                    tooltip: 'List view',
                    onPressed: () => setState(() => showCalendar = false),
                    icon: Icon(
                      showCalendar ? Icons.view_list_outlined : Icons.view_list,
                    ),
                  ),
                  IconButton(
                    tooltip: 'Calendar view',
                    onPressed: () => setState(() => showCalendar = true),
                    icon: Icon(
                      showCalendar
                          ? Icons.calendar_month
                          : Icons.calendar_month_outlined,
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton.icon(
                    onPressed: () => _openPlanForm(context),
                    icon: const Icon(Icons.add),
                    label: const Text('Add Plan'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (showCalendar)
                _PlanCalendar(plans: filteredPlans)
              else
                _PlanList(plans: filteredPlans),
              const SizedBox(height: 16),
              _WishCart(wishes: state.wishes),
            ],
          ),
        );
      },
    );
  }

  Future<void> _openPlanForm(BuildContext context, {Plan? plan}) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => _PlanForm(plan: plan),
    );
  }
}

class _PlanForm extends StatefulWidget {
  const _PlanForm({this.plan});

  final Plan? plan;

  @override
  State<_PlanForm> createState() => _PlanFormState();
}

class _PlanFormState extends State<_PlanForm> {
  final _formKey = GlobalKey<FormState>();
  late String _type;
  final _titleController = TextEditingController();
  final _costController = TextEditingController();
  final _purposeController = TextEditingController();
  final _recipientController = TextEditingController();
  final _notesController = TextEditingController();
  DateTimeRange? _range;
  String? _category;
  String _priority = 'medium';

  @override
  void initState() {
    super.initState();
    final plan = widget.plan;
    _type = plan?.type ?? 'buy';
    _titleController.text = plan?.title ?? '';
    _costController.text = plan?.estimatedCost.toStringAsFixed(2) ?? '';
    _purposeController.text = plan?.purpose ?? '';
    _recipientController.text = plan?.recipient ?? '';
    _notesController.text = plan?.notes ?? '';
    if (plan != null) {
      _range = DateTimeRange(start: plan.startDate, end: plan.endDate);
      _category = plan.category;
      _priority = plan.priority;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _costController.dispose();
    _purposeController.dispose();
    _recipientController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickRange() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 2),
      initialDateRange: _range,
    );
    if (picked != null) setState(() => _range = picked);
  }

  void _applySuggestion(List<String> categories) {
    final suggestion = suggestCategory(_titleController.text, categories);
    setState(() => _category = suggestion);
  }

  Future<void> _submit(AppState state) async {
    if (!_formKey.currentState!.validate() || _range == null) return;
    final cost = double.tryParse(_costController.text.trim()) ?? 0;
    final category =
        _category ??
        (state.categories.isNotEmpty ? state.categories.first : 'General');

    final plan = Plan.create(
      type: _type,
      title: _titleController.text.trim(),
      estimatedCost: cost,
      startDate: _range!.start,
      endDate: _range!.end,
      category: category,
      priority: _priority,
      status: widget.plan?.status ?? 'active',
      purpose: _purposeController.text.trim().isEmpty
          ? null
          : _purposeController.text.trim(),
      recipient: _recipientController.text.trim().isEmpty
          ? null
          : _recipientController.text.trim(),
      notes: _notesController.text.trim().isEmpty
          ? null
          : _notesController.text.trim(),
    );

    if (widget.plan == null) {
      await state.addPlan(plan);
    } else {
      final updated = Plan(
        id: widget.plan!.id,
        type: plan.type,
        title: plan.title,
        estimatedCost: plan.estimatedCost,
        finalCost: widget.plan!.finalCost,
        startDate: plan.startDate,
        endDate: plan.endDate,
        category: plan.category,
        priority: plan.priority,
        status: widget.plan!.status,
        purpose: plan.purpose,
        recipient: plan.recipient,
        notes: plan.notes,
      );
      await state.updatePlan(updated);
    }

    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).viewInsets.bottom;
    return Consumer<AppState>(
      builder: (context, state, _) {
        return Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, bottomPadding + 20),
          child: Form(
            key: _formKey,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.plan == null ? 'Add New Plan' : 'Edit Plan',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _titleController,
                    decoration: const InputDecoration(labelText: 'Title'),
                    validator: (value) =>
                        value == null || value.trim().length < 2
                        ? 'Title is too short'
                        : null,
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _type,
                    items: const [
                      DropdownMenuItem(value: 'buy', child: Text('Purchase')),
                      DropdownMenuItem(
                        value: 'activity',
                        child: Text('Activity'),
                      ),
                      DropdownMenuItem(value: 'gift', child: Text('Gift')),
                    ],
                    onChanged: (value) =>
                        setState(() => _type = value ?? 'buy'),
                    decoration: const InputDecoration(labelText: 'Type'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _costController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Estimated Cost',
                    ),
                    validator: (value) =>
                        value == null || double.tryParse(value) == null
                        ? 'Enter a valid amount'
                        : null,
                  ),
                  if (_type == 'buy') ...[
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _purposeController,
                      decoration: const InputDecoration(labelText: 'Purpose'),
                    ),
                  ],
                  if (_type == 'gift') ...[
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _recipientController,
                      decoration: const InputDecoration(labelText: 'Recipient'),
                    ),
                  ],
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _pickRange,
                    icon: const Icon(Icons.date_range),
                    label: Text(
                      _range == null
                          ? 'Pick date range'
                          : '${DateFormat('MMM d').format(_range!.start)} - ${DateFormat('MMM d').format(_range!.end)}',
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _category,
                    items: state.categories
                        .map(
                          (cat) =>
                              DropdownMenuItem(value: cat, child: Text(cat)),
                        )
                        .toList(),
                    onChanged: (value) => setState(() => _category = value),
                    decoration: const InputDecoration(labelText: 'Category'),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      OutlinedButton.icon(
                        onPressed: () => _applySuggestion(state.categories),
                        icon: const Icon(Icons.lightbulb_outline),
                        label: const Text('Suggest'),
                      ),
                      const Spacer(),
                      DropdownButton<String>(
                        value: _priority,
                        onChanged: (value) =>
                            setState(() => _priority = value ?? 'medium'),
                        items: const [
                          DropdownMenuItem(value: 'low', child: Text('Low')),
                          DropdownMenuItem(
                            value: 'medium',
                            child: Text('Medium'),
                          ),
                          DropdownMenuItem(value: 'high', child: Text('High')),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _notesController,
                    maxLines: 3,
                    decoration: const InputDecoration(labelText: 'Notes'),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () => _submit(state),
                      child: Text(
                        widget.plan == null ? 'Add Plan' : 'Save Changes',
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _PlanList extends StatelessWidget {
  const _PlanList({required this.plans});

  final List<Plan> plans;

  @override
  Widget build(BuildContext context) {
    if (plans.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Column(
              children: [
                Text(
                  'No Plans Found',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                const Text('Get started by adding a new plan or task.'),
              ],
            ),
          ),
        ),
      );
    }

    return Wrap(
      spacing: 16,
      runSpacing: 16,
      children: plans.map((plan) => _PlanCard(plan: plan)).toList(),
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({required this.plan});

  final Plan plan;

  @override
  Widget build(BuildContext context) {
    final formatter = DateFormat('MMM d, yyyy');
    final state = context.read<AppState>();

    return SizedBox(
      width: 320,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      plan.title,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ),
                  PopupMenuButton<String>(
                    onSelected: (value) async {
                      if (value == 'edit') {
                        await showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          builder: (context) => _PlanForm(plan: plan),
                        );
                      } else if (value == 'delete') {
                        await state.deletePlan(plan.id);
                      } else if (value == 'cancel') {
                        final updated = Plan(
                          id: plan.id,
                          type: plan.type,
                          title: plan.title,
                          estimatedCost: plan.estimatedCost,
                          finalCost: plan.finalCost,
                          startDate: plan.startDate,
                          endDate: plan.endDate,
                          category: plan.category,
                          priority: plan.priority,
                          status: 'canceled',
                          purpose: plan.purpose,
                          recipient: plan.recipient,
                          notes: plan.notes,
                        );
                        await state.updatePlan(updated);
                      } else if (value == 'complete') {
                        final controller = TextEditingController(
                          text: plan.estimatedCost.toStringAsFixed(2),
                        );
                        await showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Complete Plan'),
                            content: TextField(
                              controller: controller,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'Final amount',
                              ),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.of(context).pop(),
                                child: const Text('Cancel'),
                              ),
                              FilledButton(
                                onPressed: () async {
                                  final value =
                                      double.tryParse(controller.text.trim()) ??
                                      0;
                                  await state.completePlan(plan.id, value);
                                  if (context.mounted)
                                    Navigator.of(context).pop();
                                },
                                child: const Text('Confirm'),
                              ),
                            ],
                          ),
                        );
                      }
                    },
                    itemBuilder: (context) => const [
                      PopupMenuItem(value: 'edit', child: Text('Edit')),
                      PopupMenuItem(
                        value: 'complete',
                        child: Text('Mark completed'),
                      ),
                      PopupMenuItem(
                        value: 'cancel',
                        child: Text('Mark canceled'),
                      ),
                      PopupMenuItem(value: 'delete', child: Text('Delete')),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '${formatter.format(plan.startDate)} - ${formatter.format(plan.endDate)}',
              ),
              const SizedBox(height: 8),
              Text(
                '\$${plan.estimatedCost.toStringAsFixed(2)}',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              if (plan.purpose != null) Text('Purpose: ${plan.purpose}'),
              if (plan.recipient != null) Text('For: ${plan.recipient}'),
              if (plan.notes != null) Text('Notes: ${plan.notes}'),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [
                  Chip(label: Text(plan.category)),
                  Chip(label: Text(plan.priority)),
                  Chip(label: Text(plan.status)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PlanCalendar extends StatefulWidget {
  const _PlanCalendar({required this.plans});

  final List<Plan> plans;

  @override
  State<_PlanCalendar> createState() => _PlanCalendarState();
}

class _PlanCalendarState extends State<_PlanCalendar> {
  DateTime _focused = DateTime.now();

  List<Plan> _plansForDay(DateTime day) {
    return widget.plans.where((plan) {
      return !day.isBefore(plan.startDate) && !day.isAfter(plan.endDate);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final monthPlans = widget.plans.where((plan) {
      final start = DateTime(_focused.year, _focused.month, 1);
      final end = DateTime(_focused.year, _focused.month + 1, 0);
      return !plan.endDate.isBefore(start) && !plan.startDate.isAfter(end);
    }).toList();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: TableCalendar<Plan>(
                focusedDay: _focused,
                firstDay: DateTime(_focused.year - 1),
                lastDay: DateTime(_focused.year + 2),
                eventLoader: _plansForDay,
                onPageChanged: (day) => setState(() => _focused = day),
                calendarStyle: const CalendarStyle(
                  markerDecoration: BoxDecoration(
                    color: Color(0xFF70A1A1),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Plans in ${DateFormat('MMMM yyyy').format(_focused)}',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  if (monthPlans.isEmpty)
                    const Text('No plans for this month.')
                  else
                    ...monthPlans.map(
                      (plan) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              plan.title,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              '${DateFormat('MMM d').format(plan.startDate)} - ${DateFormat('MMM d').format(plan.endDate)}',
                            ),
                            const SizedBox(height: 4),
                            Chip(label: Text(plan.category)),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _WishCart extends StatefulWidget {
  const _WishCart({required this.wishes});

  final List<Wish> wishes;

  @override
  State<_WishCart> createState() => _WishCartState();
}

class _WishCartState extends State<_WishCart> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.shopping_cart_outlined),
                const SizedBox(width: 8),
                Text(
                  'Wish Cart',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text('A quick list of things you want to buy.'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(labelText: 'New wish'),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: () {
                    final value = _controller.text.trim();
                    if (value.isNotEmpty) {
                      context.read<AppState>().addWish(value);
                      _controller.clear();
                    }
                  },
                  icon: const Icon(Icons.add_circle_outline),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (widget.wishes.isEmpty)
              const Text('Your wish cart is empty.')
            else
              ...widget.wishes.map(
                (wish) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(wish.name),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline),
                    onPressed: () =>
                        context.read<AppState>().deleteWish(wish.id),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
