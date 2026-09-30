import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await initDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM contacts WHERE id = ? AND deleted_at IS NULL',
        [id]
      );
      if (rows.length === 0) return NextResponse.json({ success: false, error: 'Contact message not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: rows[0] });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM contacts WHERE deleted_at IS NULL ORDER BY created_at DESC, id DESC'
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Contacts GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { name, email, phone, message, subject, status } = body;

    const finalName = name?.trim();
    const finalEmail = email?.trim();
    const finalMessage = message?.trim();

    if (!finalName) {
      return NextResponse.json({ success: false, error: 'Your name is required' }, { status: 400 });
    }

    if (!finalEmail) {
      return NextResponse.json({ success: false, error: 'Your email is required' }, { status: 400 });
    }

    if (!finalMessage) {
      return NextResponse.json({ success: false, error: 'Your message is required' }, { status: 400 });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO contacts (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)',
      [
        finalName,
        finalEmail,
        phone?.trim() || '',
        subject?.trim() || 'Website Contact Form',
        finalMessage,
        status || 'unread'
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Message sent successfully! We will get back to you soon.'
    });
  } catch (error: any) {
    console.error('Contacts POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { id, name, email, phone, message, subject, status } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    if (name && email && message) {
      // Full update
      await pool.execute(
        'UPDATE contacts SET name = ?, email = ?, phone = ?, subject = ?, message = ?, status = ? WHERE id = ?',
        [name, email, phone || '', subject || 'Website Contact Form', message, status || 'read', id]
      );
    } else {
      // Status update only
      await pool.execute('UPDATE contacts SET status = ? WHERE id = ?', [status || 'read', id]);
    }

    return NextResponse.json({ success: true, message: 'Contact message updated' });
  } catch (error: any) {
    console.error('Contacts PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await initDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await pool.execute(
      'UPDATE contacts SET is_deleted = 1, isDelete = 1, deleted_at = NOW() WHERE id = ?',
      [id]
    );
    return NextResponse.json({ success: true, message: 'Contact message deleted' });
  } catch (error: any) {
    console.error('Contacts DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
