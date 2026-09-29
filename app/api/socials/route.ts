import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDB();
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM social_links ORDER BY id ASC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { platform, url, icon, is_active } = body;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO social_links (platform, url, icon, is_active) VALUES (?, ?, ?, ?)',
      [platform, url, icon || 'Globe', is_active !== undefined ? (is_active ? 1 : 0) : 1]
    );

    return NextResponse.json({ success: true, id: result.insertId, message: 'Social link created' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { id, platform, url, icon, is_active } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await pool.execute(
      'UPDATE social_links SET platform = ?, url = ?, icon = ?, is_active = ? WHERE id = ?',
      [platform, url, icon || 'Globe', is_active ? 1 : 0, id]
    );

    return NextResponse.json({ success: true, message: 'Social link updated' });
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

    await pool.execute('DELETE FROM social_links WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Social link deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
