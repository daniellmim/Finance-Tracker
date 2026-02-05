import 'dart:convert';
import 'dart:io';

import 'package:csv/csv.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:uuid/uuid.dart';

import '../backend/database_service.dart';
import '../models/models.dart';

class AppState extends ChangeNotifier {
  AppState() {
    _init();
  }

  final DatabaseService _dbService = DatabaseService.instance;
  final _uuid = const Uuid();

  bool isReady = false;
  String? initError;
  User? currentUser;

  List<String> categories = [];
  List<Expense> expenses = [];
  List<Plan> plans = [];
  List<Wish> wishes = [];
  List<BankAccount> bankAccounts = [];
  List<SmsMessage> smsMessages = [];
  List<Liability> liabilities = [];

  Future<void> _init() async {
    try {
      initError = null;
      await _dbService.database;
    } catch (e) {
      debugPrint('SpendWise init error: $e');
      initError = 'Failed to initialize local database: $e';
    } finally {
      isReady = true;
      notifyListeners();
    }
  }

  Future<void> retryInit() async {
    isReady = false;
    notifyListeners();
    await _init();
  }

  String _simpleHash(String input) {
    var hash = 0;
    for (var i = 0; i < input.length; i++) {
      final char = input.codeUnitAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  Future<bool> signup({
    required String username,
    required String email,
    required String password,
  }) async {
    final db = await _dbService.database;
    final existing = await db.query(
      'users',
      where: 'email = ?',
      whereArgs: [email],
      limit: 1,
    );
    if (existing.isNotEmpty) return false;

    final user = User(
      id: _uuid.v4(),
      username: username,
      email: email,
      passwordHash: _simpleHash(password),
    );

    await db.insert('users', user.toMap());
    currentUser = user;
    await _seedDefaults(user.id);
    await _loadUserData(user.id);
    notifyListeners();
    return true;
  }

  Future<bool> login({required String email, required String password}) async {
    final db = await _dbService.database;
    final rows = await db.query(
      'users',
      where: 'email = ?',
      whereArgs: [email],
      limit: 1,
    );
    if (rows.isEmpty) return false;
    final user = User.fromMap(rows.first);
    if (user.passwordHash != _simpleHash(password)) return false;

    currentUser = user;
    await _loadUserData(user.id);
    notifyListeners();
    return true;
  }

  Future<void> logout() async {
    currentUser = null;
    categories = [];
    expenses = [];
    plans = [];
    wishes = [];
    bankAccounts = [];
    smsMessages = [];
    liabilities = [];
    notifyListeners();
  }

  Future<void> _seedDefaults(String userId) async {
    final db = await _dbService.database;
    final existing = await db.query(
      'categories',
      where: 'user_id = ?',
      whereArgs: [userId],
    );
    if (existing.isNotEmpty) return;

    final defaults = <String>[
      'Groceries',
      'Dining Out',
      'Transport',
      'Shopping',
      'Utilities',
      'Entertainment',
      'Health',
      'Travel',
      'Gift',
      'Personal Care',
    ];
    for (final name in defaults) {
      await db.insert('categories', {
        'id': _uuid.v4(),
        'user_id': userId,
        'name': name,
      });
    }

    final now = DateTime.now();
    final defaultExpenses = [
      Expense.create(
        description: 'Coffee with a friend',
        amount: 4.50,
        category: 'Dining Out',
        date: now.subtract(const Duration(days: 1)),
      ),
      Expense.create(
        description: 'Weekly grocery shopping',
        amount: 75.20,
        category: 'Groceries',
        date: now.subtract(const Duration(days: 2)),
      ),
      Expense.create(
        description: 'New headphones',
        amount: 129.99,
        category: 'Shopping',
        date: now.subtract(const Duration(days: 4)),
      ),
    ];

    for (final expense in defaultExpenses) {
      await db.insert('expenses', expense.toMap(userId));
    }

    final defaultPlans = [
      Plan.create(
        type: 'buy',
        title: 'New Laptop',
        estimatedCost: 1200,
        startDate: now.add(const Duration(days: 10)),
        endDate: now.add(const Duration(days: 40)),
        category: 'Shopping',
        priority: 'high',
        status: 'active',
        purpose: 'Work',
      ),
      Plan.create(
        type: 'activity',
        title: 'Weekend trip',
        estimatedCost: 300,
        startDate: now.add(const Duration(days: 20)),
        endDate: now.add(const Duration(days: 22)),
        category: 'Travel',
        priority: 'medium',
        status: 'active',
      ),
    ];
    for (final plan in defaultPlans) {
      await db.insert('plans', plan.toMap(userId));
    }

    final defaultWish = Wish.create('AirPods Pro');
    await db.insert('wishes', defaultWish.toMap(userId));

    final defaultAccounts = [
      BankAccount.create(
        name: 'Everyday Checking',
        institution: 'Evergreen Bank',
        balance: 2450.75,
      ),
      BankAccount.create(
        name: 'Travel Savings',
        institution: 'Summit Credit Union',
        balance: 8200.00,
      ),
    ];
    for (final account in defaultAccounts) {
      await db.insert('bank_accounts', account.toMap(userId));
    }

    final defaultMessages = [
      SmsMessage.create(
        bankName: 'Evergreen Bank',
        sender: 'EVRGN',
        body: 'Evergreen: Your acct balance is \$2,450.75 after POS purchase.',
        detectedBalance: 2450.75,
      ),
      SmsMessage.create(
        bankName: 'Summit Credit Union',
        sender: 'SUMMIT',
        body: 'Summit CU: Balance update \$8,200.00. Reply STOP to opt out.',
        detectedBalance: 8200.00,
      ),
    ];
    for (final message in defaultMessages) {
      await db.insert('sms_messages', message.toMap(userId));
    }

    final defaultLiabilities = [
      Liability.create(
        name: 'Car loan',
        amount: 350.00,
        dueDate: now.add(const Duration(days: 12)),
        notes: 'Monthly payment',
      ),
      Liability.create(
        name: 'Credit card',
        amount: 120.50,
        dueDate: now.add(const Duration(days: 6)),
      ),
    ];
    for (final liability in defaultLiabilities) {
      await db.insert('liabilities', liability.toMap(userId));
    }
  }

  Future<void> _loadUserData(String userId) async {
    final db = await _dbService.database;
    categories = (await db.query(
      'categories',
      where: 'user_id = ?',
      whereArgs: [userId],
    )).map((row) => row['name'] as String).toList();

    expenses = (await db.query(
      'expenses',
      where: 'user_id = ?',
      whereArgs: [userId],
    )).map(Expense.fromMap).toList()..sort((a, b) => b.date.compareTo(a.date));

    plans =
        (await db.query(
            'plans',
            where: 'user_id = ?',
            whereArgs: [userId],
          )).map(Plan.fromMap).toList()
          ..sort((a, b) => a.startDate.compareTo(b.startDate));

    wishes = (await db.query(
      'wishes',
      where: 'user_id = ?',
      whereArgs: [userId],
    )).map(Wish.fromMap).toList();

    bankAccounts = (await db.query(
      'bank_accounts',
      where: 'user_id = ?',
      whereArgs: [userId],
    )).map(BankAccount.fromMap).toList();

    smsMessages =
        (await db.query(
            'sms_messages',
            where: 'user_id = ?',
            whereArgs: [userId],
          )).map(SmsMessage.fromMap).toList()
          ..sort((a, b) => b.receivedAt.compareTo(a.receivedAt));

    liabilities = (await db.query(
      'liabilities',
      where: 'user_id = ?',
      whereArgs: [userId],
    )).map(Liability.fromMap).toList();
  }

  Future<void> addCategory(String name) async {
    final user = currentUser;
    if (user == null) return;
    if (categories.contains(name)) return;
    final db = await _dbService.database;
    await db.insert('categories', {
      'id': _uuid.v4(),
      'user_id': user.id,
      'name': name,
    });
    categories = [...categories, name];
    notifyListeners();
  }

  Future<void> addExpense(Expense expense) async {
    final user = currentUser;
    if (user == null) return;
    final db = await _dbService.database;
    await db.insert('expenses', expense.toMap(user.id));
    expenses = [expense, ...expenses];
    notifyListeners();
  }

  Future<void> deleteExpense(String id) async {
    final user = currentUser;
    if (user == null) return;
    final db = await _dbService.database;
    await db.delete(
      'expenses',
      where: 'id = ? AND user_id = ?',
      whereArgs: [id, user.id],
    );
    expenses = expenses.where((exp) => exp.id != id).toList();
    notifyListeners();
  }

  Future<void> addPlan(Plan plan) async {
    final user = currentUser;
    if (user == null) return;
    final db = await _dbService.database;
    await db.insert('plans', plan.toMap(user.id));
    plans = [...plans, plan]
      ..sort((a, b) => a.startDate.compareTo(b.startDate));
    notifyListeners();
  }

  Future<void> updatePlan(Plan plan) async {
    final user = currentUser;
    if (user == null) return;
    final db = await _dbService.database;
    await db.update(
      'plans',
      plan.toMap(user.id),
      where: 'id = ? AND user_id = ?',
      whereArgs: [plan.id, user.id],
    );
    plans = plans.map((item) => item.id == plan.id ? plan : item).toList();
    notifyListeners();
  }

  Future<void> deletePlan(String id) async {
    final user = currentUser;
    if (user == null) return;
    final db = await _dbService.database;
    await db.delete(
      'plans',
      where: 'id = ? AND user_id = ?',
      whereArgs: [id, user.id],
    );
    plans = plans.where((plan) => plan.id != id).toList();
    notifyListeners();
  }

  Future<void> completePlan(String id, double finalAmount) async {
    final plan = plans.firstWhere(
      (plan) => plan.id == id,
      orElse: () => throw StateError('Plan not found'),
    );
    final updated = Plan(
      id: plan.id,
      type: plan.type,
      title: plan.title,
      estimatedCost: plan.estimatedCost,
      finalCost: finalAmount,
      startDate: plan.startDate,
      endDate: plan.endDate,
      category: plan.category,
      priority: plan.priority,
      status: 'completed',
      purpose: plan.purpose,
      recipient: plan.recipient,
      notes: plan.notes,
    );
    await updatePlan(updated);
    await addExpense(
      Expense.create(
        description: plan.title,
        amount: finalAmount,
        category: plan.category,
        date: DateTime.now(),
      ),
    );
  }

  Future<void> addWish(String name) async {
    final user = currentUser;
    if (user == null) return;
    final wish = Wish.create(name);
    final db = await _dbService.database;
    await db.insert('wishes', wish.toMap(user.id));
    wishes = [wish, ...wishes];
    notifyListeners();
  }

  Future<void> deleteWish(String id) async {
    final user = currentUser;
    if (user == null) return;
    final db = await _dbService.database;
    await db.delete(
      'wishes',
      where: 'id = ? AND user_id = ?',
      whereArgs: [id, user.id],
    );
    wishes = wishes.where((wish) => wish.id != id).toList();
    notifyListeners();
  }

  Future<void> addBankAccount(BankAccount account) async {
    final user = currentUser;
    if (user == null) return;
    final db = await _dbService.database;
    await db.insert('bank_accounts', account.toMap(user.id));
    bankAccounts = [...bankAccounts, account];
    notifyListeners();
  }

  Future<void> updateBankAccount(BankAccount account) async {
    final user = currentUser;
    if (user == null) return;
    final db = await _dbService.database;
    await db.update(
      'bank_accounts',
      account.toMap(user.id),
      where: 'id = ? AND user_id = ?',
      whereArgs: [account.id, user.id],
    );
    bankAccounts = bankAccounts
        .map((item) => item.id == account.id ? account : item)
        .toList();
    notifyListeners();
  }

  Future<void> deleteBankAccount(String id) async {
    final user = currentUser;
    if (user == null) return;
    final db = await _dbService.database;
    await db.delete(
      'bank_accounts',
      where: 'id = ? AND user_id = ?',
      whereArgs: [id, user.id],
    );
    bankAccounts = bankAccounts.where((account) => account.id != id).toList();
    notifyListeners();
  }

  Future<void> addSmsMessage(SmsMessage message) async {
    final user = currentUser;
    if (user == null) return;
    final db = await _dbService.database;
    await db.insert('sms_messages', message.toMap(user.id));
    smsMessages = [message, ...smsMessages];
    notifyListeners();
  }

  Future<void> deleteSmsMessage(String id) async {
    final user = currentUser;
    if (user == null) return;
    final db = await _dbService.database;
    await db.delete(
      'sms_messages',
      where: 'id = ? AND user_id = ?',
      whereArgs: [id, user.id],
    );
    smsMessages = smsMessages.where((msg) => msg.id != id).toList();
    notifyListeners();
  }

  Future<void> addLiability(Liability liability) async {
    final user = currentUser;
    if (user == null) return;
    final db = await _dbService.database;
    await db.insert('liabilities', liability.toMap(user.id));
    liabilities = [liability, ...liabilities];
    notifyListeners();
  }

  Future<void> deleteLiability(String id) async {
    final user = currentUser;
    if (user == null) return;
    final db = await _dbService.database;
    await db.delete(
      'liabilities',
      where: 'id = ? AND user_id = ?',
      whereArgs: [id, user.id],
    );
    liabilities = liabilities.where((item) => item.id != id).toList();
    notifyListeners();
  }

  double parseBalanceFromText(String text) {
    final match = RegExp(
      r'(?:\$|USD\s?)(\d+(?:\.\d{1,2})?)',
      caseSensitive: false,
    ).firstMatch(text.replaceAll(',', ''));
    if (match == null) return double.nan;
    final value = double.tryParse(match.group(1) ?? '');
    return value ?? double.nan;
  }

  Future<void> applySmsToAccount(String accountId, String messageId) async {
    final account = bankAccounts.firstWhere((item) => item.id == accountId);
    final message = smsMessages.firstWhere((item) => item.id == messageId);
    final detected =
        message.detectedBalance ?? parseBalanceFromText(message.body);
    if (detected.isNaN) return;
    final updated = BankAccount(
      id: account.id,
      name: account.name,
      institution: account.institution,
      balance: detected,
      updatedAt: DateTime.now(),
      lastMessageId: message.id,
    );
    await updateBankAccount(updated);
  }

  String exportDataJson() {
    final data = {
      'expenses': expenses
          .map(
            (e) => {
              'id': e.id,
              'description': e.description,
              'amount': e.amount,
              'category': e.category,
              'date': e.date.toIso8601String(),
            },
          )
          .toList(),
      'categories': categories,
      'plans': plans
          .map(
            (p) => {
              'id': p.id,
              'type': p.type,
              'title': p.title,
              'estimatedCost': p.estimatedCost,
              'finalCost': p.finalCost,
              'startDate': p.startDate.toIso8601String(),
              'endDate': p.endDate.toIso8601String(),
              'category': p.category,
              'priority': p.priority,
              'status': p.status,
              'purpose': p.purpose,
              'recipient': p.recipient,
              'notes': p.notes,
            },
          )
          .toList(),
      'wishes': wishes
          .map(
            (w) => {
              'id': w.id,
              'name': w.name,
              'createdAt': w.createdAt.toIso8601String(),
            },
          )
          .toList(),
      'bankAccounts': bankAccounts
          .map(
            (b) => {
              'id': b.id,
              'name': b.name,
              'institution': b.institution,
              'balance': b.balance,
              'updatedAt': b.updatedAt.toIso8601String(),
              'lastMessageId': b.lastMessageId,
            },
          )
          .toList(),
      'smsMessages': smsMessages
          .map(
            (m) => {
              'id': m.id,
              'bankName': m.bankName,
              'sender': m.sender,
              'body': m.body,
              'receivedAt': m.receivedAt.toIso8601String(),
              'detectedBalance': m.detectedBalance,
            },
          )
          .toList(),
      'liabilities': liabilities
          .map(
            (l) => {
              'id': l.id,
              'name': l.name,
              'amount': l.amount,
              'dueDate': l.dueDate?.toIso8601String(),
              'notes': l.notes,
            },
          )
          .toList(),
    };
    return const JsonEncoder.withIndent('  ').convert(data);
  }

  Future<bool> importDataJson(String jsonString) async {
    final user = currentUser;
    if (user == null) return false;
    try {
      final data = jsonDecode(jsonString) as Map<String, dynamic>;
      final db = await _dbService.database;
      final batch = db.batch();

      batch.delete('expenses', where: 'user_id = ?', whereArgs: [user.id]);
      batch.delete('categories', where: 'user_id = ?', whereArgs: [user.id]);
      batch.delete('plans', where: 'user_id = ?', whereArgs: [user.id]);
      batch.delete('wishes', where: 'user_id = ?', whereArgs: [user.id]);
      batch.delete('bank_accounts', where: 'user_id = ?', whereArgs: [user.id]);
      batch.delete('sms_messages', where: 'user_id = ?', whereArgs: [user.id]);
      batch.delete('liabilities', where: 'user_id = ?', whereArgs: [user.id]);

      final newCategories = (data['categories'] as List<dynamic>? ?? [])
          .cast<String>();
      for (final name in newCategories) {
        batch.insert('categories', {
          'id': _uuid.v4(),
          'user_id': user.id,
          'name': name,
        });
      }

      for (final item in (data['expenses'] as List<dynamic>? ?? [])) {
        final map = item as Map<String, dynamic>;
        batch.insert('expenses', {
          'id': map['id'] ?? _uuid.v4(),
          'user_id': user.id,
          'description': map['description'],
          'amount': map['amount'],
          'category': map['category'],
          'date': DateTime.parse(map['date']).millisecondsSinceEpoch,
        });
      }

      for (final item in (data['plans'] as List<dynamic>? ?? [])) {
        final map = item as Map<String, dynamic>;
        batch.insert('plans', {
          'id': map['id'] ?? _uuid.v4(),
          'user_id': user.id,
          'type': map['type'],
          'title': map['title'],
          'estimated_cost': map['estimatedCost'],
          'final_cost': map['finalCost'],
          'start_date': DateTime.parse(map['startDate']).millisecondsSinceEpoch,
          'end_date': DateTime.parse(map['endDate']).millisecondsSinceEpoch,
          'category': map['category'],
          'priority': map['priority'],
          'status': map['status'],
          'purpose': map['purpose'],
          'recipient': map['recipient'],
          'notes': map['notes'],
        });
      }

      for (final item in (data['wishes'] as List<dynamic>? ?? [])) {
        final map = item as Map<String, dynamic>;
        batch.insert('wishes', {
          'id': map['id'] ?? _uuid.v4(),
          'user_id': user.id,
          'name': map['name'],
          'created_at': DateTime.parse(map['createdAt']).millisecondsSinceEpoch,
        });
      }

      for (final item in (data['bankAccounts'] as List<dynamic>? ?? [])) {
        final map = item as Map<String, dynamic>;
        batch.insert('bank_accounts', {
          'id': map['id'] ?? _uuid.v4(),
          'user_id': user.id,
          'name': map['name'],
          'institution': map['institution'],
          'balance': map['balance'],
          'updated_at': DateTime.parse(map['updatedAt']).millisecondsSinceEpoch,
          'last_message_id': map['lastMessageId'],
        });
      }

      for (final item in (data['smsMessages'] as List<dynamic>? ?? [])) {
        final map = item as Map<String, dynamic>;
        batch.insert('sms_messages', {
          'id': map['id'] ?? _uuid.v4(),
          'user_id': user.id,
          'bank_name': map['bankName'],
          'sender': map['sender'],
          'body': map['body'],
          'received_at': DateTime.parse(
            map['receivedAt'],
          ).millisecondsSinceEpoch,
          'detected_balance': map['detectedBalance'],
        });
      }

      for (final item in (data['liabilities'] as List<dynamic>? ?? [])) {
        final map = item as Map<String, dynamic>;
        batch.insert('liabilities', {
          'id': map['id'] ?? _uuid.v4(),
          'user_id': user.id,
          'name': map['name'],
          'amount': map['amount'],
          'due_date': map['dueDate'] == null
              ? null
              : DateTime.parse(map['dueDate']).millisecondsSinceEpoch,
          'notes': map['notes'],
        });
      }

      await batch.commit(noResult: true);
      await _loadUserData(user.id);
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> shareExpensesCsv() async {
    final user = currentUser;
    if (user == null) return;
    final rows = <List<dynamic>>[
      ['Date', 'Description', 'Category', 'Amount'],
      ...expenses.map(
        (e) => [
          e.date.toIso8601String(),
          e.description,
          e.category,
          e.amount.toStringAsFixed(2),
        ],
      ),
    ];
    final csvData = const ListToCsvConverter().convert(rows);
    final dir = await getTemporaryDirectory();
    final filePath =
        '${dir.path}/spendwise-expenses-${DateTime.now().toIso8601String().split('T').first}.csv';
    final file = await File(filePath).writeAsString(csvData);
    await Share.shareXFiles([
      XFile(file.path),
    ], text: 'SpendWise expense export');
  }
}
