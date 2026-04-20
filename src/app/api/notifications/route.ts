import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    let query = `
      SELECT * FROM notifications 
      WHERE userId = ?
    `;
    const params: any[] = [userId];

    if (unreadOnly) {
      query += ` AND isRead = 0`;
    }

    query += ` ORDER BY createdAt DESC LIMIT 50`;

    const notifications = db.prepare(query).all(...params);

    // Count unread
    const unreadCount = db
      .prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0')
      .get(userId) as any;

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount?.count || 0
    });
  } catch (error) {
    console.error('Notification fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { notificationId, isRead } = await request.json();

    db.prepare(
      `UPDATE notifications SET isRead = ? WHERE id = ?`
    ).run(isRead ? 1 : 0, notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { notificationId } = await request.json();

    db.prepare('DELETE FROM notifications WHERE id = ?').run(notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
