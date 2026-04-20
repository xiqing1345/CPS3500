const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'dormitory.db'));

const alice = db.prepare('SELECT id FROM users WHERE email = ?').get('user1@example.com');
const bob   = db.prepare('SELECT id FROM users WHERE email = ?').get('user2@example.com');
const chris = db.prepare('SELECT id FROM users WHERE email = ?').get('user3@example.com');
const diana = db.prepare('SELECT id FROM users WHERE email = ?').get('user4@example.com');

const ins = db.prepare(
  'INSERT INTO messages (id, content, authorId, isPrivate, roomId, createdAt) VALUES (?, ?, ?, 0, ?, ?)'
);

const msgs = [
  { a: bob.id,   c: "By the way, does anyone know the WiFi password for the 5GHz network? Mine keeps dropping." },
  { a: chris.id, c: "It's DormRoom2024! The RA gave it to me last month." },
  { a: diana.id, c: "Thanks Chris! I had the same problem 😊" },
  { a: alice.id, c: "Quick question – is anyone using the washing machine right now? I need to do laundry." },
  { a: bob.id,   c: "Nope, it's free! I just finished." },
  { a: alice.id, c: "Perfect, thanks Bob!" },
  { a: chris.id, c: "Reminder: the cleaning proposal is still waiting for Diana's vote. Please check it out 👀" },
  { a: diana.id, c: "Oh right, I'll vote now! Done – left a comment too." },
  { a: bob.id,   c: "Hey, I cooked too much pasta tonight, anyone want some? 🍝" },
  { a: alice.id, c: "Yes please!! Coming over in 5 min 😂" },
  { a: chris.id, c: "Same, be there in a sec lol" },
  { a: diana.id, c: "Save some for me!! On my way back from the library" },
  { a: bob.id,   c: "Haha ok ok, made enough for everyone 😄" },
  { a: alice.id, c: "Has anyone seen my blue umbrella? I left it in the hallway yesterday." },
  { a: chris.id, c: "Yes, it's near the front door! I'll hang it on the hook." },
  { a: alice.id, c: "Thank you so much Chris! 🙏" },
  { a: diana.id, c: "Good morning everyone! Anyone up for a coffee run before class? ☕" },
  { a: bob.id,   c: "I'm in! Leaving in 10 minutes." },
  { a: alice.id, c: "Can you grab me an oat latte? I'll Venmo you 😊" },
  { a: chris.id, c: "Just a black coffee please, thanks Diana!" },
  { a: diana.id, c: "Got everyone's orders, back in 20 mins!" },
  { a: bob.id,   c: "Reminder to everyone: please don't leave dishes in the sink overnight. Found a pile this morning 😤" },
  { a: chris.id, c: "Sorry that was me, had a late assignment. Will clean up now!" },
  { a: alice.id, c: "No worries, just good to keep it tidy 👍" },
  { a: diana.id, c: "BTW has anyone checked the new cleaning proposal? Alice did a great job writing it up." },
  { a: bob.id,   c: "Yeah I already voted Approve on the cleaning schedule. Makes total sense." },
  { a: chris.id, c: "Same! Though I suggested adding a monthly deep-clean in my comment." },
  { a: alice.id, c: "Great feedback Chris! I might update the proposal to include that." },
  { a: diana.id, c: "Also – the quiet hours proposal needs more votes. Finals are coming up fast 😰" },
  { a: bob.id,   c: "I already voted Approve on that one too. Noise at midnight is really affecting my sleep." },
  { a: alice.id, c: "Same here. Hope we can get unanimous agreement before finals start." },
  { a: chris.id, c: "100% agree. Library is an option but nothing beats studying in your own room when it's quiet." },
];

const base = Date.now() - msgs.length * 3 * 60000;
for (let i = 0; i < msgs.length; i++) {
  ins.run(crypto.randomUUID(), msgs[i].c, msgs[i].a, 'group', new Date(base + i * 3 * 60000).toISOString());
}
console.log('Inserted', msgs.length, 'new group messages.');


// ── More Alice-Bob DMs ───────────────────────────────────────────
const insPriv = db.prepare(
  'INSERT INTO messages (id, content, authorId, isPrivate, recipientId, createdAt) VALUES (?, ?, ?, 1, ?, ?)'
);
const abDMs = [
  { from: alice.id, to: bob.id, c: "Bob, did you vote on the guest policy proposal yet?" },
  { from: bob.id, to: alice.id, c: "Not yet, I wrote it so I figured I'd wait to see other votes first 😅" },
  { from: alice.id, to: bob.id, c: "Diana rejected it and Chris suggested a modification. Might be worth reading their comments." },
  { from: bob.id, to: alice.id, c: "Oh interesting. I'll check it out tonight. Maybe I should revise the proposal." },
  { from: alice.id, to: bob.id, c: "Yeah, Chris's idea about weekday curfew for guests sounds reasonable." },
  { from: bob.id, to: alice.id, c: "Agreed. I'll update it. Thanks for the heads up Alice!" },
];
const abBase = Date.now() - abDMs.length * 5 * 60000;
for (let i = 0; i < abDMs.length; i++) {
  const m = abDMs[i];
  insPriv.run(crypto.randomUUID(), m.c, m.from, m.to, new Date(abBase + i * 5 * 60000).toISOString());
}
console.log('Inserted', abDMs.length, 'more Alice-Bob DMs.');
