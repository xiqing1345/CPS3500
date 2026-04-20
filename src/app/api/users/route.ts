import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (userId) {
      const user = db.prepare('SELECT id, name, email, avatar, role FROM users WHERE id = ?').get(userId);
      return NextResponse.json(user || {});
    }

    // Get all users except password
    const users = db.prepare('SELECT id, name, email, avatar, role FROM users').all();
    return NextResponse.json(users || []);
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
