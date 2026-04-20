import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// Initialize database on first request
initializeDatabase();

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, action } = await request.json();

    if (action === 'signup') {
      // Check if user exists
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = randomUUID();

      // Create user
      db.prepare(
        'INSERT INTO users (id, name, email, password, avatar) VALUES (?, ?, ?, ?, ?)'
      ).run(userId, name, email, hashedPassword, `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`);

      return NextResponse.json({
        success: true,
        user: { id: userId, name, email }
      });
    } else if (action === 'signin') {
      // Find user
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password as string);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
