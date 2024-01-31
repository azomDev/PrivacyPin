// ignore_for_file: avoid_print

import "package:path/path.dart";
import "package:sqflite/sqflite.dart";
import 'models.dart';

class SQLDatabase {
  static const String _personsTable = "persons";
  static const String _databaseName = "database.sqlite";

  static Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), _databaseName);
    return await openDatabase(path, version: 1, onCreate: _createDatabase);
  }

  static Future<void> _createDatabase(Database db, int version) async {
    print("DATABASE: The database is being created");
    await db.execute('''
      CREATE TABLE $_personsTable (
        id TEXT,
        username TEXT
      )''');

    await db.insert(_personsTable, {
      "id": "123",
      "username": "John Doe",
    });

    await db.insert(_personsTable, {
      "id": "456",
      "username": "Doe John",
    });

    print("DATABASE: Database created successfully!");
  }

  static Future<void> nukeDatabase() async {
    print("DATABASE: Nuking the database (deleting all persons).");
    Database db = await _initDatabase();
    await db.delete(_personsTable); // Delete all records from the table
    db.close();
    print("DATABASE: Database nuked successfully!");
  }

  static insertPerson(Person person) async {
    print("DATABASE: Inserting person: $person");
    Database db = await _initDatabase();
    await db.insert(_personsTable, person.toMap());
    db.close();
  }

  static Future<List<Person>> getAllFriends() async {
    print("DATABASE: Fetching persons.");
    Database db = await _initDatabase();
    List<Map<String, dynamic>> maps = await db.query(_personsTable);
    db.close();
    print("DATABASE: Fetched data: $maps");
    return List.generate(maps.length, (index) {
      return Person.fromMap(maps[index]);
    });
  }
}
