import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart' as sqflite;
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:sqflite_common_ffi_web/sqflite_ffi_web.dart';

class DatabaseService {
  DatabaseService._();

  static final DatabaseService instance = DatabaseService._();
  final DatabaseFactory _databaseFactory = _createDatabaseFactory();
  Database? _db;

  static bool get _isDesktop =>
      !kIsWeb &&
      (defaultTargetPlatform == TargetPlatform.windows ||
          defaultTargetPlatform == TargetPlatform.linux ||
          defaultTargetPlatform == TargetPlatform.macOS);

  static DatabaseFactory _createDatabaseFactory() {
    if (kIsWeb) {
      return databaseFactoryFfiWeb;
    }
    if (_isDesktop) {
      sqfliteFfiInit();
      return databaseFactoryFfi;
    }
    return sqflite.databaseFactory;
  }

  Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await _init();
    return _db!;
  }

  Future<Database> _init() async {
    final dbDir = await _databaseFactory.getDatabasesPath();
    final dbPath = p.join(dbDir, 'spendwise.db');
    return _databaseFactory.openDatabase(
      dbPath,
      options: OpenDatabaseOptions(version: 1, onCreate: _onCreate),
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
      );
    ''');

    await db.execute('''
      CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL
      );
    ''');

    await db.execute('''
      CREATE TABLE expenses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date INTEGER NOT NULL
      );
    ''');

    await db.execute('''
      CREATE TABLE plans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        estimated_cost REAL NOT NULL,
        final_cost REAL,
        start_date INTEGER NOT NULL,
        end_date INTEGER NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        purpose TEXT,
        recipient TEXT,
        notes TEXT
      );
    ''');

    await db.execute('''
      CREATE TABLE wishes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    ''');

    await db.execute('''
      CREATE TABLE bank_accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        institution TEXT NOT NULL,
        balance REAL NOT NULL,
        updated_at INTEGER NOT NULL,
        last_message_id TEXT
      );
    ''');

    await db.execute('''
      CREATE TABLE sms_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        bank_name TEXT NOT NULL,
        sender TEXT NOT NULL,
        body TEXT NOT NULL,
        received_at INTEGER NOT NULL,
        detected_balance REAL
      );
    ''');

    await db.execute('''
      CREATE TABLE liabilities (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        due_date INTEGER,
        notes TEXT
      );
    ''');
  }
}
