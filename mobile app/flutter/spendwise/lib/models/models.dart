import 'package:uuid/uuid.dart';

const _uuid = Uuid();

class User {
  final String id;
  final String username;
  final String email;
  final String passwordHash;

  const User({
    required this.id,
    required this.username,
    required this.email,
    required this.passwordHash,
  });

  factory User.fromMap(Map<String, Object?> map) {
    return User(
      id: map['id'] as String,
      username: map['username'] as String,
      email: map['email'] as String,
      passwordHash: map['password_hash'] as String,
    );
  }

  Map<String, Object?> toMap() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'password_hash': passwordHash,
    };
  }
}

class Expense {
  final String id;
  final String description;
  final double amount;
  final String category;
  final DateTime date;

  const Expense({
    required this.id,
    required this.description,
    required this.amount,
    required this.category,
    required this.date,
  });

  factory Expense.create({
    required String description,
    required double amount,
    required String category,
    required DateTime date,
  }) {
    return Expense(
      id: _uuid.v4(),
      description: description,
      amount: amount,
      category: category,
      date: date,
    );
  }

  factory Expense.fromMap(Map<String, Object?> map) {
    return Expense(
      id: map['id'] as String,
      description: map['description'] as String,
      amount: (map['amount'] as num).toDouble(),
      category: map['category'] as String,
      date: DateTime.fromMillisecondsSinceEpoch(map['date'] as int),
    );
  }

  Map<String, Object?> toMap(String userId) {
    return {
      'id': id,
      'user_id': userId,
      'description': description,
      'amount': amount,
      'category': category,
      'date': date.millisecondsSinceEpoch,
    };
  }
}

class Plan {
  final String id;
  final String type;
  final String title;
  final double estimatedCost;
  final double? finalCost;
  final DateTime startDate;
  final DateTime endDate;
  final String category;
  final String priority;
  final String status;
  final String? purpose;
  final String? recipient;
  final String? notes;

  const Plan({
    required this.id,
    required this.type,
    required this.title,
    required this.estimatedCost,
    required this.startDate,
    required this.endDate,
    required this.category,
    required this.priority,
    required this.status,
    this.finalCost,
    this.purpose,
    this.recipient,
    this.notes,
  });

  factory Plan.create({
    required String type,
    required String title,
    required double estimatedCost,
    required DateTime startDate,
    required DateTime endDate,
    required String category,
    required String priority,
    required String status,
    double? finalCost,
    String? purpose,
    String? recipient,
    String? notes,
  }) {
    return Plan(
      id: _uuid.v4(),
      type: type,
      title: title,
      estimatedCost: estimatedCost,
      startDate: startDate,
      endDate: endDate,
      category: category,
      priority: priority,
      status: status,
      finalCost: finalCost,
      purpose: purpose,
      recipient: recipient,
      notes: notes,
    );
  }

  factory Plan.fromMap(Map<String, Object?> map) {
    return Plan(
      id: map['id'] as String,
      type: map['type'] as String,
      title: map['title'] as String,
      estimatedCost: (map['estimated_cost'] as num).toDouble(),
      finalCost: map['final_cost'] == null
          ? null
          : (map['final_cost'] as num).toDouble(),
      startDate: DateTime.fromMillisecondsSinceEpoch(map['start_date'] as int),
      endDate: DateTime.fromMillisecondsSinceEpoch(map['end_date'] as int),
      category: map['category'] as String,
      priority: map['priority'] as String,
      status: map['status'] as String,
      purpose: map['purpose'] as String?,
      recipient: map['recipient'] as String?,
      notes: map['notes'] as String?,
    );
  }

  Map<String, Object?> toMap(String userId) {
    return {
      'id': id,
      'user_id': userId,
      'type': type,
      'title': title,
      'estimated_cost': estimatedCost,
      'final_cost': finalCost,
      'start_date': startDate.millisecondsSinceEpoch,
      'end_date': endDate.millisecondsSinceEpoch,
      'category': category,
      'priority': priority,
      'status': status,
      'purpose': purpose,
      'recipient': recipient,
      'notes': notes,
    };
  }
}

class Wish {
  final String id;
  final String name;
  final DateTime createdAt;

  const Wish({required this.id, required this.name, required this.createdAt});

  factory Wish.create(String name) {
    return Wish(id: _uuid.v4(), name: name, createdAt: DateTime.now());
  }

  factory Wish.fromMap(Map<String, Object?> map) {
    return Wish(
      id: map['id'] as String,
      name: map['name'] as String,
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['created_at'] as int),
    );
  }

  Map<String, Object?> toMap(String userId) {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'created_at': createdAt.millisecondsSinceEpoch,
    };
  }
}

class BankAccount {
  final String id;
  final String name;
  final String institution;
  final double balance;
  final DateTime updatedAt;
  final String? lastMessageId;

  const BankAccount({
    required this.id,
    required this.name,
    required this.institution,
    required this.balance,
    required this.updatedAt,
    this.lastMessageId,
  });

  factory BankAccount.create({
    required String name,
    required String institution,
    required double balance,
  }) {
    return BankAccount(
      id: _uuid.v4(),
      name: name,
      institution: institution,
      balance: balance,
      updatedAt: DateTime.now(),
    );
  }

  factory BankAccount.fromMap(Map<String, Object?> map) {
    return BankAccount(
      id: map['id'] as String,
      name: map['name'] as String,
      institution: map['institution'] as String,
      balance: (map['balance'] as num).toDouble(),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(map['updated_at'] as int),
      lastMessageId: map['last_message_id'] as String?,
    );
  }

  Map<String, Object?> toMap(String userId) {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'institution': institution,
      'balance': balance,
      'updated_at': updatedAt.millisecondsSinceEpoch,
      'last_message_id': lastMessageId,
    };
  }
}

class SmsMessage {
  final String id;
  final String bankName;
  final String sender;
  final String body;
  final DateTime receivedAt;
  final double? detectedBalance;

  const SmsMessage({
    required this.id,
    required this.bankName,
    required this.sender,
    required this.body,
    required this.receivedAt,
    this.detectedBalance,
  });

  factory SmsMessage.create({
    required String bankName,
    required String sender,
    required String body,
    double? detectedBalance,
  }) {
    return SmsMessage(
      id: _uuid.v4(),
      bankName: bankName,
      sender: sender,
      body: body,
      receivedAt: DateTime.now(),
      detectedBalance: detectedBalance,
    );
  }

  factory SmsMessage.fromMap(Map<String, Object?> map) {
    return SmsMessage(
      id: map['id'] as String,
      bankName: map['bank_name'] as String,
      sender: map['sender'] as String,
      body: map['body'] as String,
      receivedAt: DateTime.fromMillisecondsSinceEpoch(
        map['received_at'] as int,
      ),
      detectedBalance: map['detected_balance'] == null
          ? null
          : (map['detected_balance'] as num).toDouble(),
    );
  }

  Map<String, Object?> toMap(String userId) {
    return {
      'id': id,
      'user_id': userId,
      'bank_name': bankName,
      'sender': sender,
      'body': body,
      'received_at': receivedAt.millisecondsSinceEpoch,
      'detected_balance': detectedBalance,
    };
  }
}

class Liability {
  final String id;
  final String name;
  final double amount;
  final DateTime? dueDate;
  final String? notes;

  const Liability({
    required this.id,
    required this.name,
    required this.amount,
    this.dueDate,
    this.notes,
  });

  factory Liability.create({
    required String name,
    required double amount,
    DateTime? dueDate,
    String? notes,
  }) {
    return Liability(
      id: _uuid.v4(),
      name: name,
      amount: amount,
      dueDate: dueDate,
      notes: notes,
    );
  }

  factory Liability.fromMap(Map<String, Object?> map) {
    return Liability(
      id: map['id'] as String,
      name: map['name'] as String,
      amount: (map['amount'] as num).toDouble(),
      dueDate: map['due_date'] == null
          ? null
          : DateTime.fromMillisecondsSinceEpoch(map['due_date'] as int),
      notes: map['notes'] as String?,
    );
  }

  Map<String, Object?> toMap(String userId) {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'amount': amount,
      'due_date': dueDate?.millisecondsSinceEpoch,
      'notes': notes,
    };
  }
}
