import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'dormitory.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      role TEXT DEFAULT 'resident',
      dormId TEXT DEFAULT 'dorm1',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      authorId TEXT NOT NULL,
      isPrivate INTEGER DEFAULT 0,
      recipientId TEXT,
      roomId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(authorId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(recipientId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      initiatorId TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(initiatorId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      proposalId TEXT NOT NULL,
      userId TEXT NOT NULL,
      voteType TEXT NOT NULL,
      comment TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(proposalId, userId),
      FOREIGN KEY(proposalId) REFERENCES proposals(id) ON DELETE CASCADE,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      relatedId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_authorId ON messages(authorId);
    CREATE INDEX IF NOT EXISTS idx_messages_roomId ON messages(roomId);
    CREATE INDEX IF NOT EXISTS idx_messages_recipientId ON messages(recipientId);
    CREATE INDEX IF NOT EXISTS idx_votes_userId ON votes(userId);
    CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
  `);
}

export default db;
