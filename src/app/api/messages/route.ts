import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const roomId = url.searchParams.get('roomId');
    const recipientId = url.searchParams.get('recipientId');
    const userId = url.searchParams.get('userId');

    let messages;

    if (roomId) {
      // Group chat
      messages = db
        .prepare(
          `SELECT m.*, u.name, u.avatar 
           FROM messages m 
           JOIN users u ON m.authorId = u.id 
           WHERE m.roomId = ? 
           ORDER BY m.createdAt DESC 
           LIMIT 50`
        )
        .all(roomId);
    } else if (recipientId && userId) {
      // Private chat
      messages = db
        .prepare(
          `SELECT m.*, u.name, u.avatar 
           FROM messages m 
           JOIN users u ON m.authorId = u.id 
           WHERE (m.authorId = ? AND m.recipientId = ? AND m.isPrivate = 1)
           OR (m.authorId = ? AND m.recipientId = ? AND m.isPrivate = 1)
           ORDER BY m.createdAt DESC 
           LIMIT 50`
        )
        .all(userId, recipientId, recipientId, userId);
    }

    return NextResponse.json(messages?.reverse() || []);
  } catch (error) {
    console.error('Message fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, authorId, isPrivate, recipientId, roomId } = await request.json();

    const messageId = randomUUID();

    db.prepare(
      `INSERT INTO messages (id, content, authorId, isPrivate, recipientId, roomId) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(messageId, content, authorId, isPrivate ? 1 : 0, recipientId, roomId);

    // Create notification for private message
    if (isPrivate && recipientId) {
      const senderName = db.prepare('SELECT name FROM users WHERE id = ?').get(authorId) as any;
      const notificationId = randomUUID();
      db.prepare(
        `INSERT INTO notifications (id, userId, type, title, content, relatedId) 
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        notificationId,
        recipientId,
        'message',
        `New message from ${senderName?.name || 'Unknown'}`,
        content,
        messageId
      );
    }

    return NextResponse.json({ success: true, id: messageId });
  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
