import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDB();
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM contacts ORDER BY created_at DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, Email and Message are required' }, { status: 400 });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO contacts (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || '', subject || 'Website Contact Form', message, 'unread']
    );

    return NextResponse.json({ success: true, id: result.insertId, message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { id, status } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await pool.execute('UPDATE contacts SET status = ? WHERE id = ?', [status || 'read', id]);
    return NextResponse.json({ success: true, message: 'Contact status updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await initDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await pool.execute('DELETE FROM contacts WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Contact deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
