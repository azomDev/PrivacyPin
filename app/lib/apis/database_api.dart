import "package:sqflite/sqflite.dart";
import '../components/models.dart';

class SQLDatabase {
  static const String _users_table = "users";
  static const String _database_name = "database.sqlite";
  static late Database _db;

  static initDatabase() async {
    String path = '${await getDatabasesPath()}/$_database_name';
    _db = await openDatabase(path, version: 1, onCreate: _createDatabase);
  }

  static Future<void> _createDatabase(Database db, int version) async {
    print("DATABASE: The database is being created");
    await db.execute('''
      CREATE TABLE $_users_table
      (id TEXT, username TEXT, am_i_sending INTEGER)
    ''');
    print("DATABASE: Database created successfully!");
  }

  static Future<void> insertUser(User user) async {
    print("DATABASE: Inserting user: $user");
    await _db.insert(_users_table, user.toMap());
  }

  static Future<List<User>> getAllUsers() async {
    List<Map<String, dynamic>> maps = await _db.query(_users_table);
    return List.generate(maps.length, (index) {
      return User.fromMap(maps[index]);
    });
  }

  static Future<void> modifyUser(String user_id, bool new_value) async {
    print("DATABASE: Modifying user $user_id with new value: $new_value");
    await _db.update(
      _users_table,
      {'am_i_sending': new_value ? 1 : 0},
      where: 'id = ?',
      whereArgs: [user_id],
    );
  }
}
