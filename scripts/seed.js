// Script to seed demo users
// Run with: node scripts/seed.js

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const dbPath = path.join(process.cwd(), 'dormitory.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
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

async function createUser(name, email, password) {
  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existingUser) {
    console.log(`User ${email} already exists`);
    return existingUser;
  }

  const userId = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);
  db.prepare(
    'INSERT INTO users (id, name, email, password, avatar) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, name, email, hashedPassword, `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`);

  console.log(`Created user: ${email}`);
  return { id: userId, name, email };
}

async function seed() {
  console.log('Seeding database...');

  // Update existing users to English names if they have Chinese names
  const updates = [
    { email: 'user1@example.com', name: 'Alice Chen' },
    { email: 'user2@example.com', name: 'Bob Smith' },
    { email: 'user3@example.com', name: 'Chris Wang' },
    { email: 'user4@example.com', name: 'Diana Lee' },
  ];

  for (const u of updates) {
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(u.email);
    if (existing) {
      db.prepare('UPDATE users SET name = ?, avatar = ? WHERE email = ?')
        .run(u.name, `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`, u.email);
      console.log(`Updated: ${u.email} -> ${u.name}`);
    } else {
      await createUser(u.name, u.email, 'password123');
    }
  }

  // Get user IDs for seeding proposals/messages
  const alice = db.prepare('SELECT * FROM users WHERE email = ?').get('user1@example.com');
  const bob = db.prepare('SELECT * FROM users WHERE email = ?').get('user2@example.com');
  const chris = db.prepare('SELECT * FROM users WHERE email = ?').get('user3@example.com');
  const diana = db.prepare('SELECT * FROM users WHERE email = ?').get('user4@example.com');

  if (!alice || !bob || !chris || !diana) {
    console.log('Users not found, skipping proposals/messages seed.');
    return;
  }

  // ── Seed group chat messages ──────────────────────────────────────
  const existingMsg = db.prepare('SELECT COUNT(*) as c FROM messages WHERE isPrivate = 0').get();
  if (existingMsg.c === 0) {
    const groupMessages = [
      { authorId: alice.id, content: 'Hey everyone! Just a reminder that we have a dorm meeting this Friday at 7 PM 🏠' },
      { authorId: bob.id,   content: 'Thanks Alice! Should we bring any agenda items?' },
      { authorId: chris.id, content: "I'd like to discuss the cleaning schedule – it hasn't been followed well lately." },
      { authorId: diana.id, content: 'Also we should talk about quiet hours during finals week. It gets really noisy after midnight.' },
      { authorId: alice.id, content: 'Great points! I\'ll create formal proposals for both topics so we can vote on them.' },
      { authorId: bob.id,   content: 'Sounds good. Also the common room TV remote has been missing for a week 😅' },
      { authorId: chris.id, content: 'lol I think it fell behind the couch, will check' },
      { authorId: diana.id, content: 'Found it!! It was under the cushion 🎉' },
      { authorId: alice.id, content: 'Haha mystery solved. See you all Friday!' },
      { authorId: bob.id,   content: 'By the way, does anyone know the WiFi password for the 5GHz network? Mine keeps dropping.' },
      { authorId: chris.id, content: 'It\'s DormRoom2024! The RA gave it to me last month.' },
      { authorId: diana.id, content: 'Thanks Chris! I had the same problem 😊' },
      { authorId: alice.id, content: 'Quick question – is anyone using the washing machine right now? I need to do laundry.' },
      { authorId: bob.id,   content: 'Nope, it\'s free! I just finished.' },
      { authorId: alice.id, content: 'Perfect, thanks Bob!' },
      { authorId: chris.id, content: 'Reminder: the cleaning proposal is still waiting for Diana\'s vote. Please check it out 👀' },
      { authorId: diana.id, content: 'Oh right, I\'ll vote now!' },
      { authorId: diana.id, content: 'Done! Left a comment too.' },
      { authorId: bob.id,   content: 'Hey, I cooked too much pasta tonight, anyone want some? 🍝' },
      { authorId: alice.id, content: 'Yes please!! Coming over in 5 min 😂' },
      { authorId: chris.id, content: 'Same, be there in a sec lol' },
      { authorId: diana.id, content: 'Save some for me!! On my way back from the library' },
      { authorId: bob.id,   content: 'Haha ok ok, made enough for everyone 😄' },
      { authorId: alice.id, content: 'Has anyone seen my blue umbrella? I left it in the hallway yesterday.' },
      { authorId: chris.id, content: 'I think I saw it near the front door, let me check' },
      { authorId: chris.id, content: 'Yes, it\'s here! I\'ll hang it on the hook so it doesn\'t get knocked around.' },
      { authorId: alice.id, content: 'Thank you so much Chris! 🙏' },
      { authorId: diana.id, content: 'Good morning everyone! Anyone up for a coffee run before class? ☕' },
      { authorId: bob.id,   content: 'I\'m in! Leaving in 10 minutes.' },
      { authorId: alice.id, content: 'Can you grab me an oat latte? I\'ll Venmo you 😊' },
      { authorId: diana.id, content: 'Sure! Chris, you want anything?' },
      { authorId: chris.id, content: 'Just a black coffee please, thanks Diana!' },
    ];
    const insertMsg = db.prepare(
      'INSERT INTO messages (id, content, authorId, isPrivate, roomId, createdAt) VALUES (?, ?, ?, 0, ?, ?)'
    );
    const base = Date.now() - groupMessages.length * 4 * 60000;
    for (let i = 0; i < groupMessages.length; i++) {
      const m = groupMessages[i];
      insertMsg.run(crypto.randomUUID(), m.content, m.authorId, 'group', new Date(base + i * 4 * 60000).toISOString());
    }
    console.log('Inserted group chat messages.');
  } else {
    console.log('Group messages already exist, skipping.');
  }

  // ── Seed a private DM between Alice and Bob ─────────────────────
  const existingDM = db.prepare(
    'SELECT COUNT(*) as c FROM messages WHERE isPrivate = 1 AND authorId = ? AND recipientId = ?'
  ).get(alice.id, bob.id);
  if (existingDM.c === 0) {
    const dmMessages = [
      { authorId: alice.id, recipientId: bob.id,   content: 'Hey Bob, can you cover my kitchen-cleaning shift this Saturday? I have an exam.' },
      { authorId: bob.id,   recipientId: alice.id, content: 'Sure no problem! You can cover mine next Wednesday then 😊' },
      { authorId: alice.id, recipientId: bob.id,   content: 'Deal! Thanks so much, you\'re a lifesaver.' },
      { authorId: bob.id,   recipientId: alice.id, content: 'No worries! Good luck on your exam 💪' },
      { authorId: alice.id, recipientId: bob.id,   content: 'Thank you! By the way, did you submit your part of the group project yet?' },
      { authorId: bob.id,   recipientId: alice.id, content: 'Just finished it literally 10 minutes ago 😅 Cutting it close as usual' },
      { authorId: alice.id, recipientId: bob.id,   content: 'Haha classic Bob. Mine\'s been done since yesterday 😄' },
    ];
    const insertDM = db.prepare(
      'INSERT INTO messages (id, content, authorId, isPrivate, recipientId, createdAt) VALUES (?, ?, ?, 1, ?, ?)'
    );
    const base = Date.now() - dmMessages.length * 8 * 60000;
    for (let i = 0; i < dmMessages.length; i++) {
      const m = dmMessages[i];
      insertDM.run(crypto.randomUUID(), m.content, m.authorId, m.recipientId, new Date(base + i * 8 * 60000).toISOString());
    }
    console.log('Inserted Alice-Bob DM messages.');
  } else {
    console.log('Alice-Bob DM messages already exist, skipping.');
  }

  // ── Seed a private DM between Chris and Diana ────────────────────
  const existingDM2 = db.prepare(
    'SELECT COUNT(*) as c FROM messages WHERE isPrivate = 1 AND authorId = ? AND recipientId = ?'
  ).get(chris.id, diana.id);
  if (existingDM2.c === 0) {
    const dmMessages2 = [
      { authorId: chris.id, recipientId: diana.id, content: 'Hey Diana, what did you think about the guest policy proposal Bob made?' },
      { authorId: diana.id, recipientId: chris.id, content: 'Honestly I think 2 nights per month is too many. That\'s why I voted against it.' },
      { authorId: chris.id, recipientId: diana.id, content: 'I get that. I suggested a modification – guests should leave by 11 PM on weekdays.' },
      { authorId: diana.id, recipientId: chris.id, content: 'That\'s actually a good compromise. Maybe we can convince Bob to update the proposal.' },
      { authorId: chris.id, recipientId: diana.id, content: 'I\'ll message him later. Also – are you going to the library tonight? I need a study buddy 📚' },
      { authorId: diana.id, recipientId: chris.id, content: 'Yes! Planning to go around 7. Want to go together?' },
      { authorId: chris.id, recipientId: diana.id, content: 'Perfect, see you at 7 then 👍' },
    ];
    const insertDM2 = db.prepare(
      'INSERT INTO messages (id, content, authorId, isPrivate, recipientId, createdAt) VALUES (?, ?, ?, 1, ?, ?)'
    );
    const base2 = Date.now() - dmMessages2.length * 10 * 60000;
    for (let i = 0; i < dmMessages2.length; i++) {
      const m = dmMessages2[i];
      insertDM2.run(crypto.randomUUID(), m.content, m.authorId, m.recipientId, new Date(base2 + i * 10 * 60000).toISOString());
    }
    console.log('Inserted Chris-Diana DM messages.');
  } else {
    console.log('Chris-Diana DM messages already exist, skipping.');
  }

  // ── Seed proposals ────────────────────────────────────────────────
  const existingProposals = db.prepare('SELECT COUNT(*) as c FROM proposals').get();
  if (existingProposals.c === 0) {
    const proposals = [
      {
        id: crypto.randomUUID(),
        title: 'Weekly Cleaning Schedule Rotation',
        description: 'Establish a fair weekly rotation for cleaning common areas (kitchen, bathroom, living room). Each resident takes one area per week.',
        type: 'Cleaning Schedule',
        initiatorId: alice.id,
        content: 'Rotation plan:\n- Week A: Alice (kitchen), Bob (bathroom), Chris (living room), Diana (hallway)\n- Week B: rotate one position clockwise\nCleaning must be done by Sunday 10 PM.',
        status: 'active',
      },
      {
        id: crypto.randomUUID(),
        title: 'Quiet Hours During Finals Week',
        description: 'Enforce strict quiet hours from 10 PM to 8 AM during the two weeks of final exams. No parties, loud music, or gatherings in common areas.',
        type: 'Quiet Hours',
        initiatorId: diana.id,
        content: 'Finals quiet hours: 10 PM – 8 AM. Violations should be reported to the dorm supervisor. Exceptions must be agreed by all residents.',
        status: 'active',
      },
      {
        id: crypto.randomUUID(),
        title: 'Overnight Guest Policy',
        description: 'Guests may stay overnight up to 2 nights per month per resident. Advance notice of 24 hours required. Guests must follow dorm rules.',
        type: 'Visitor Policy',
        initiatorId: bob.id,
        content: 'Guest rules:\n- Max 2 overnight stays per month\n- 24-hour advance notice to all roommates\n- Guests are the resident\'s responsibility\n- No guests during exam periods',
        status: 'active',
      },
    ];

    const insertProposal = db.prepare(
      'INSERT INTO proposals (id, title, description, type, initiatorId, status, content, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const insertVote = db.prepare(
      'INSERT INTO votes (id, proposalId, userId, voteType, comment, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertNotif = db.prepare(
      'INSERT INTO notifications (id, userId, type, title, content, isRead, relatedId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const now = new Date().toISOString();

    // Proposal 1: Cleaning — Alice created, Bob approves, Chris suggests modification
    insertProposal.run(proposals[0].id, proposals[0].title, proposals[0].description, proposals[0].type, proposals[0].initiatorId, proposals[0].status, proposals[0].content, now);
    insertVote.run(crypto.randomUUID(), proposals[0].id, bob.id, 'approve', 'Sounds fair and easy to follow!', now);
    insertVote.run(crypto.randomUUID(), proposals[0].id, chris.id, 'modify', 'Can we also add a bathroom deep-clean once a month?', now);

    // Proposal 2: Quiet Hours — Diana created, Alice & Bob approve
    insertProposal.run(proposals[1].id, proposals[1].title, proposals[1].description, proposals[1].type, proposals[1].initiatorId, proposals[1].status, proposals[1].content, now);
    insertVote.run(crypto.randomUUID(), proposals[1].id, alice.id, 'approve', 'Absolutely need this during finals!', now);
    insertVote.run(crypto.randomUUID(), proposals[1].id, bob.id, 'approve', 'Agreed, the noise last finals was terrible.', now);

    // Proposal 3: Guest Policy — Bob created, Diana rejects
    insertProposal.run(proposals[2].id, proposals[2].title, proposals[2].description, proposals[2].type, proposals[2].initiatorId, proposals[2].status, proposals[2].content, now);
    insertVote.run(crypto.randomUUID(), proposals[2].id, diana.id, 'reject', 'I think 2 nights per month is too many. I\'d prefer 1 night per month.', now);
    insertVote.run(crypto.randomUUID(), proposals[2].id, chris.id, 'modify', 'Can we add a rule that guests must leave by 11 PM on weekdays?', now);

    // Notifications for all residents about each proposal
    for (const user of [alice, bob, chris, diana]) {
      for (const p of proposals) {
        if (user.id !== p.initiatorId) {
          insertNotif.run(
            crypto.randomUUID(), user.id, 'proposal',
            `New Proposal: ${p.title}`,
            `A new proposal has been submitted by your roommate. Check it out and cast your vote!`,
            0, p.id, now
          );
        }
      }
    }
    console.log('Inserted proposals, votes, and notifications.');
  } else {
    console.log('Proposals already exist, skipping.');
  }

  console.log('Seeding complete!');
  console.log('You can log in with:');
  console.log('  user1@example.com / password123  (Alice Chen)');
  console.log('  user2@example.com / password123  (Bob Smith)');
  console.log('  user3@example.com / password123  (Chris Wang)');
  console.log('  user4@example.com / password123  (Diana Lee)');
}

seed().catch(console.error);
