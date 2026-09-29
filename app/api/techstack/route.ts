import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDB();
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM tech_stack ORDER BY category ASC, id DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { name, category, icon_url, proficiency_level } = body;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO tech_stack (name, category, icon_url, proficiency_level) VALUES (?, ?, ?, ?)',
      [name, category || 'Frontend', icon_url || '', proficiency_level || 90]
    );

    return NextResponse.json({ success: true, id: result.insertId, message: 'Tech stack item created' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { id, name, category, icon_url, proficiency_level } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await pool.execute(
      'UPDATE tech_stack SET name = ?, category = ?, icon_url = ?, proficiency_level = ? WHERE id = ?',
      [name, category || 'Frontend', icon_url || '', proficiency_level || 90, id]
    );

    return NextResponse.json({ success: true, message: 'Tech stack item updated' });
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

    await pool.execute('DELETE FROM tech_stack WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Tech stack item deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
