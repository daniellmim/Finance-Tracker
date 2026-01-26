import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../state/app_state.dart';
import '../widgets/app_header.dart';

class BankingScreen extends StatefulWidget {
  const BankingScreen({super.key});

  @override
  State<BankingScreen> createState() => _BankingScreenState();
}

class _BankingScreenState extends State<BankingScreen> {
  final _accountNameController = TextEditingController();
  final _accountInstitutionController = TextEditingController();
  final _accountBalanceController = TextEditingController();

  final _messageBankController = TextEditingController();
  final _messageSenderController = TextEditingController();
  final _messageBodyController = TextEditingController();
  final _messageDetectedController = TextEditingController();

  final _liabilityNameController = TextEditingController();
  final _liabilityAmountController = TextEditingController();
  final _liabilityNotesController = TextEditingController();
  DateTime? _liabilityDueDate;

  String? _selectedAccountId;
  String? _selectedMessageId;

  @override
  void dispose() {
    _accountNameController.dispose();
    _accountInstitutionController.dispose();
    _accountBalanceController.dispose();
    _messageBankController.dispose();
    _messageSenderController.dispose();
    _messageBodyController.dispose();
    _messageDetectedController.dispose();
    _liabilityNameController.dispose();
    _liabilityAmountController.dispose();
    _liabilityNotesController.dispose();
    super.dispose();
  }

  Future<void> _pickDueDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _liabilityDueDate ?? DateTime.now(),
      firstDate: DateTime(DateTime.now().year - 1),
      lastDate: DateTime(DateTime.now().year + 5),
    );
    if (picked != null) setState(() => _liabilityDueDate = picked);
  }

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$');

    return Consumer<AppState>(
      builder: (context, state, _) {
        final totalCash = state.bankAccounts.fold<double>(
          0,
          (sum, item) => sum + item.balance,
        );
        final totalLiabilities = state.liabilities.fold<double>(
          0,
          (sum, item) => sum + item.amount,
        );
        final lastThirtyDaysSpend = state.expenses
            .where((expense) {
              return expense.date.isAfter(
                DateTime.now().subtract(const Duration(days: 30)),
              );
            })
            .fold<double>(0, (sum, item) => sum + item.amount);

        final cashAfterLiabilities = totalCash - totalLiabilities;
        final forecastAfterSpend = cashAfterLiabilities - lastThirtyDaysSpend;

        return SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SpendwiseAppHeader(title: 'SpendWise'),
              const SizedBox(height: 20),
              Wrap(
                spacing: 16,
                runSpacing: 16,
                children: [
                  SizedBox(
                    width: 520,
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(
                                  Icons.account_balance_wallet_outlined,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Bank Accounts',
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            TextField(
                              controller: _accountNameController,
                              decoration: const InputDecoration(
                                labelText: 'Account name',
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _accountInstitutionController,
                              decoration: const InputDecoration(
                                labelText: 'Institution',
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _accountBalanceController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'Balance',
                              ),
                            ),
                            const SizedBox(height: 8),
                            FilledButton.icon(
                              onPressed: () {
                                final name = _accountNameController.text.trim();
                                final institution =
                                    _accountInstitutionController.text.trim();
                                final balance = double.tryParse(
                                  _accountBalanceController.text.trim(),
                                );
                                if (name.isEmpty ||
                                    institution.isEmpty ||
                                    balance == null)
                                  return;
                                state.addBankAccount(
                                  BankAccount.create(
                                    name: name,
                                    institution: institution,
                                    balance: balance,
                                  ),
                                );
                                _accountNameController.clear();
                                _accountInstitutionController.clear();
                                _accountBalanceController.clear();
                              },
                              icon: const Icon(Icons.add),
                              label: const Text('Add bank account'),
                            ),
                            const SizedBox(height: 12),
                            if (state.bankAccounts.isEmpty)
                              const Text(
                                'Add your first bank account to start tracking balances.',
                              )
                            else
                              ...state.bankAccounts.map(
                                (account) => Card(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  child: ListTile(
                                    title: Text(account.name),
                                    subtitle: Text(account.institution),
                                    trailing: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.end,
                                      children: [
                                        Text(
                                          currency.format(account.balance),
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        Text(
                                          DateFormat(
                                            'MMM d, h:mm a',
                                          ).format(account.updatedAt),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 420,
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.pie_chart_outline),
                                const SizedBox(width: 8),
                                Text(
                                  'Forecast Snapshot',
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            _SnapshotTile(
                              label: 'Cash on hand',
                              value: currency.format(totalCash),
                            ),
                            _SnapshotTile(
                              label: 'Liabilities',
                              value: currency.format(totalLiabilities),
                              isNegative: true,
                            ),
                            _SnapshotTile(
                              label: 'Available after liabilities',
                              value: currency.format(cashAfterLiabilities),
                            ),
                            _SnapshotTile(
                              label: 'Last 30 days expenses',
                              value: currency.format(lastThirtyDaysSpend),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Forecast after expenses: ${currency.format(forecastAfterSpend)}',
                            ),
                          ],
                        ),
                      ),
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
                    width: 520,
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.sms_outlined),
                                const SizedBox(width: 8),
                                Text(
                                  'Bank SMS Inbox',
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            TextField(
                              controller: _messageBankController,
                              decoration: const InputDecoration(
                                labelText: 'Bank name',
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _messageSenderController,
                              decoration: const InputDecoration(
                                labelText: 'Sender or shortcode',
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _messageBodyController,
                              maxLines: 3,
                              decoration: const InputDecoration(
                                labelText: 'Message body',
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _messageDetectedController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'Detected balance (optional)',
                              ),
                            ),
                            const SizedBox(height: 8),
                            FilledButton.icon(
                              onPressed: () {
                                final bank = _messageBankController.text.trim();
                                final sender = _messageSenderController.text
                                    .trim();
                                final body = _messageBodyController.text.trim();
                                if (bank.isEmpty ||
                                    sender.isEmpty ||
                                    body.isEmpty)
                                  return;
                                final detected = double.tryParse(
                                  _messageDetectedController.text.trim(),
                                );
                                state.addSmsMessage(
                                  SmsMessage.create(
                                    bankName: bank,
                                    sender: sender,
                                    body: body,
                                    detectedBalance: detected,
                                  ),
                                );
                                _messageBankController.clear();
                                _messageSenderController.clear();
                                _messageBodyController.clear();
                                _messageDetectedController.clear();
                              },
                              icon: const Icon(Icons.add),
                              label: const Text('Add message'),
                            ),
                            const SizedBox(height: 12),
                            if (state.smsMessages.isEmpty)
                              const Text('No SMS alerts yet.')
                            else
                              ...state.smsMessages.map(
                                (message) => ListTile(
                                  title: Text(message.bankName),
                                  subtitle: Text(message.body),
                                  trailing: IconButton(
                                    icon: const Icon(Icons.delete_outline),
                                    onPressed: () =>
                                        state.deleteSmsMessage(message.id),
                                  ),
                                  leading: Radio<String>(
                                    value: message.id,
                                    groupValue: _selectedMessageId,
                                    onChanged: (value) => setState(
                                      () => _selectedMessageId = value,
                                    ),
                                  ),
                                ),
                              ),
                            const Divider(height: 24),
                            DropdownButtonFormField<String>(
                              value: _selectedAccountId,
                              decoration: const InputDecoration(
                                labelText: 'Apply selected SMS to account',
                              ),
                              items: state.bankAccounts
                                  .map(
                                    (account) => DropdownMenuItem(
                                      value: account.id,
                                      child: Text(
                                        '${account.institution} - ${account.name}',
                                      ),
                                    ),
                                  )
                                  .toList(),
                              onChanged: (value) =>
                                  setState(() => _selectedAccountId = value),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(
                                  child: FilledButton(
                                    onPressed:
                                        _selectedAccountId == null ||
                                            _selectedMessageId == null
                                        ? null
                                        : () => state.applySmsToAccount(
                                            _selectedAccountId!,
                                            _selectedMessageId!,
                                          ),
                                    child: const Text('Sync balance from SMS'),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: () => setState(
                                      () => _selectedMessageId = null,
                                    ),
                                    child: const Text('Clear selection'),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 420,
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.credit_card_outlined),
                                const SizedBox(width: 8),
                                Text(
                                  'Liabilities',
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            TextField(
                              controller: _liabilityNameController,
                              decoration: const InputDecoration(
                                labelText: 'Liability name',
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _liabilityAmountController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'Amount',
                              ),
                            ),
                            const SizedBox(height: 8),
                            OutlinedButton.icon(
                              onPressed: _pickDueDate,
                              icon: const Icon(Icons.event),
                              label: Text(
                                _liabilityDueDate == null
                                    ? 'Select due date'
                                    : DateFormat(
                                        'MMM d, yyyy',
                                      ).format(_liabilityDueDate!),
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _liabilityNotesController,
                              maxLines: 2,
                              decoration: const InputDecoration(
                                labelText: 'Notes (optional)',
                              ),
                            ),
                            const SizedBox(height: 8),
                            FilledButton(
                              onPressed: () {
                                final name = _liabilityNameController.text
                                    .trim();
                                final amount = double.tryParse(
                                  _liabilityAmountController.text.trim(),
                                );
                                if (name.isEmpty || amount == null) return;
                                state.addLiability(
                                  Liability.create(
                                    name: name,
                                    amount: amount,
                                    dueDate: _liabilityDueDate,
                                    notes:
                                        _liabilityNotesController.text
                                            .trim()
                                            .isEmpty
                                        ? null
                                        : _liabilityNotesController.text.trim(),
                                  ),
                                );
                                _liabilityNameController.clear();
                                _liabilityAmountController.clear();
                                _liabilityNotesController.clear();
                                setState(() => _liabilityDueDate = null);
                              },
                              child: const Text('Add liability'),
                            ),
                            const SizedBox(height: 12),
                            if (state.liabilities.isEmpty)
                              const Text(
                                'Add liabilities to refine your forecast.',
                              )
                            else
                              ...state.liabilities.map(
                                (item) => ListTile(
                                  title: Text(item.name),
                                  subtitle: item.dueDate == null
                                      ? null
                                      : Text(
                                          'Due ${DateFormat('MMM d, yyyy').format(item.dueDate!)}',
                                        ),
                                  trailing: IconButton(
                                    icon: const Icon(Icons.delete_outline),
                                    onPressed: () =>
                                        state.deleteLiability(item.id),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SnapshotTile extends StatelessWidget {
  const _SnapshotTile({
    required this.label,
    required this.value,
    this.isNegative = false,
  });

  final String label;
  final String value;
  final bool isNegative;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: isNegative ? Colors.red : null,
            ),
          ),
        ],
      ),
    );
  }
}
