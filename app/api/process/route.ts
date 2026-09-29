import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDB();
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM process_philosophy ORDER BY step_number ASC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { step_number, title, description, icon } = body;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO process_philosophy (step_number, title, description, icon) VALUES (?, ?, ?, ?)',
      [step_number || 1, title, description, icon || 'Compass']
    );

    return NextResponse.json({ success: true, id: result.insertId, message: 'Process step created' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { id, step_number, title, description, icon } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await pool.execute(
      'UPDATE process_philosophy SET step_number = ?, title = ?, description = ?, icon = ? WHERE id = ?',
      [step_number || 1, title, description, icon || 'Compass', id]
    );

    return NextResponse.json({ success: true, message: 'Process step updated' });
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

    await pool.execute('DELETE FROM process_philosophy WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Process step deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
