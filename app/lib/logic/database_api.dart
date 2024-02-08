import "package:path/path.dart";
import "package:sqflite/sqflite.dart";
import 'models.dart';

class SQLDatabase {
  static const String _users_table = "users";
  static const String _links_table = "links";
  static const String _database_name = "database.sqlite";
  static late Database _db;

  static initDatabase() async {
    String path = join(await getDatabasesPath(), _database_name);
    _db = await openDatabase(path, version: 1, onCreate: _createDatabase);
  }

  static Future<void> _createDatabase(Database db, int version) async {
    print("DATABASE: The database is being created");
    await db.execute('''
      CREATE TABLE $_users_table
      (id TEXT, username TEXT)
    ''');
    await db.execute('''
      CREATE TABLE $_links_table
      (id TEXT, receiver_user_id TEXT, am_i_sending INTEGER)
    ''');
    print("DATABASE: Database created successfully!");
  }

  static Future<void> nukeUsersTable() async {
    print("DATABASE: Nuking the users table.");
    await _db.delete(_users_table);
    print("DATABASE: Table nuked successfully!");
  }

  static Future<void> nukeLinksTable() async {
    print("DATABASE: Nuking the links table (deleting all links).");
    await _db.delete(_links_table);
    print("DATABASE: Table nuked successfully!");
  }

  static void insertUser(User user) async {
    print("DATABASE: Inserting user: $user");
    await _db.insert(_users_table, user.toMap());
  }

  static Future<User> getUser(String user_id) async {
    final List<Map<String, dynamic>> maps = await _db.query(
      _users_table,
      where: 'id = ?',
      whereArgs: [user_id],
    );
    return User.fromMap(maps.first);
  }

  static Future<List<Link>> getLinks() async {
    List<Map<String, dynamic>> maps = await _db.query(_links_table);
    return List.generate(maps.length, (index) {
      return Link.fromDbMap(maps[index]);
    });
  }

  static Future<void> insertUsers(List<User> users) async {
    print("DATABASE: Inserting users: $users");
    Batch batch = _db.batch();
    for (User user in users) {
      batch.insert(_users_table, user.toMap());
    }
    await batch.commit();
    print("DATABASE: Users inserted successfully!");
  }

  static Future<void> insertLinks(List<Link> links) async {
    print("DATABASE: Inserting links: $links");
    Batch batch = _db.batch();
    for (Link link in links) {
      batch.insert(_links_table, link.toMap());
    }
    await batch.commit();
    print("DATABASE: Links inserted successfully!");
  }

  static Future<void> modifyLink(String link_id, bool new_value) async {
    print("DATABASE: Modifying link $link_id with new value: $new_value");
    await _db.update(
      _links_table,
      {'am_i_sending': new_value ? 1 : 0},
      where: 'id = ?',
      whereArgs: [link_id],
    );
    print("DATABASE: Link modified successfully!");
  }

  static Future<void> createLink(Link link) async {
    await _db.insert(_links_table, link.toMap());
  }
}
