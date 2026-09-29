import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDB();
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM faqs ORDER BY order_index ASC, id DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { question, answer, category, order_index } = body;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO faqs (question, answer, category, order_index) VALUES (?, ?, ?, ?)',
      [question, answer, category || 'General', order_index || 0]
    );

    return NextResponse.json({ success: true, id: result.insertId, message: 'FAQ created' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { id, question, answer, category, order_index } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await pool.execute(
      'UPDATE faqs SET question = ?, answer = ?, category = ?, order_index = ? WHERE id = ?',
      [question, answer, category || 'General', order_index || 0, id]
    );

    return NextResponse.json({ success: true, message: 'FAQ updated' });
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

    await pool.execute('DELETE FROM faqs WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'FAQ deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
