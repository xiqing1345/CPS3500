import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const proposalId = url.searchParams.get('proposalId');
    const all = url.searchParams.get('all');

    // Return all votes (for AI context)
    if (all === 'true') {
      const votes = db
        .prepare(
          `SELECT v.*, u.name, u.avatar
           FROM votes v
           JOIN users u ON v.userId = u.id
           ORDER BY v.createdAt DESC`
        )
        .all();
      return NextResponse.json(votes || []);
    }

    const votes = db
      .prepare(
        `SELECT v.*, u.name, u.avatar
         FROM votes v
         JOIN users u ON v.userId = u.id
         WHERE v.proposalId = ?
         ORDER BY v.createdAt DESC`
      )
      .all(proposalId);

    return NextResponse.json(votes || []);
  } catch (error) {
    console.error('Vote fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { proposalId, userId, voteType, comment } = await request.json();

    const voteId = randomUUID();

    // Check if user already voted
    const existingVote = db
      .prepare('SELECT * FROM votes WHERE proposalId = ? AND userId = ?')
      .get(proposalId, userId);

    let isUpdate = false;
    if (existingVote) {
      // Update vote
      db.prepare(
        `UPDATE votes SET voteType = ?, comment = ? WHERE id = ?`
      ).run(voteType, comment, (existingVote as any).id);
      isUpdate = true;
    } else {
      // Insert new vote
      db.prepare(
        `INSERT INTO votes (id, proposalId, userId, voteType, comment) 
         VALUES (?, ?, ?, ?, ?)`
      ).run(voteId, proposalId, userId, voteType, comment);
    }

    // Check if should auto-approve (all residents voted approve)
    const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(proposalId) as any;
    if (proposal.status === 'active') {
      const totalResidents = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('resident') as any;
      const approveVotes = db.prepare('SELECT COUNT(*) as count FROM votes WHERE proposalId = ? AND voteType = ?').get(proposalId, 'approve') as any;

      if (approveVotes.count === totalResidents.count && totalResidents.count > 0) {
        // All approved
        db.prepare('UPDATE proposals SET status = ? WHERE id = ?').run('approved', proposalId);

        // Notify all users
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
            `Proposal unanimously approved: ${proposal.title}`,
            'The proposal has been unanimously approved!',
            proposalId
          );
        });
      }
    }

    // Notify initiator
    const initiator = db.prepare('SELECT id FROM proposals WHERE id = ?').get(proposalId) as any;
    if (initiator) {
      const voter = db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as any;
      const notificationId = randomUUID();
      db.prepare(
        `INSERT INTO notifications (id, userId, type, title, content, relatedId) 
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        notificationId,
        proposal.initiatorId,
        'vote',
        `New vote from ${voter?.name || 'Unknown'}: ${voteType}`,
        comment || '',
        proposalId
      );
    }

    return NextResponse.json({ success: true, id: isUpdate ? (existingVote as any).id : voteId });
  } catch (error) {
    console.error('Vote creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
