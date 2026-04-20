import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'active';

    const proposals = db
      .prepare(
        `SELECT p.*, u.name as initiatorName, u.avatar as initiatorAvatar,
                COUNT(DISTINCT v.id) as totalVotes,
                SUM(CASE WHEN v.voteType = 'approve' THEN 1 ELSE 0 END) as approveCount,
                SUM(CASE WHEN v.voteType = 'reject' THEN 1 ELSE 0 END) as rejectCount,
                SUM(CASE WHEN v.voteType = 'modify' THEN 1 ELSE 0 END) as modifyCount
         FROM proposals p
         JOIN users u ON p.initiatorId = u.id
         LEFT JOIN votes v ON p.id = v.proposalId
         WHERE p.status = ?
         GROUP BY p.id
         ORDER BY p.createdAt DESC`
      )
      .all(status);

    return NextResponse.json(proposals || []);
  } catch (error) {
    console.error('Proposal fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, type, initiatorId, content } = await request.json();

    const proposalId = randomUUID();

    db.prepare(
      `INSERT INTO proposals (id, title, description, type, initiatorId, content) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(proposalId, title, description, type, initiatorId, JSON.stringify(content));

    // Notify all users
    const users = db.prepare('SELECT id FROM users WHERE id != ?').all(initiatorId);
    users.forEach((user: any) => {
      const notificationId = randomUUID();
      db.prepare(
        `INSERT INTO notifications (id, userId, type, title, content, relatedId) 
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        notificationId,
        user.id,
        'proposal',
        `New ${type} proposal: ${title}`,
        description,
        proposalId
      );
    });

    return NextResponse.json({ success: true, id: proposalId });
  } catch (error) {
    console.error('Proposal creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { proposalId, title, description, content } = await request.json();

    // Check if proposal is still active and not yet approved unanimously
    const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(proposalId) as any;
    
    if (!proposal || proposal.status !== 'active') {
      return NextResponse.json({ error: 'Proposal cannot be modified' }, { status: 400 });
    }

    db.prepare(
      `UPDATE proposals SET title = ?, description = ?, content = ? WHERE id = ?`
    ).run(title, description, JSON.stringify(content), proposalId);

    // Notify all users about modification
    const users = db.prepare('SELECT id FROM users WHERE id != ?').all(proposal.initiatorId);
    users.forEach((user: any) => {
      const notificationId = randomUUID();
      db.prepare(
        `INSERT INTO notifications (id, userId, type, title, content, relatedId) 
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        notificationId,
        user.id,
        'proposal',
        `Proposal updated: ${title}`,
        description,
        proposalId
      );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Proposal update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
