import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDB();
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM projects ORDER BY is_highlighted DESC, order_index ASC, id DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { title, category, description, image_url, project_url, is_highlighted, order_index } = body;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO projects (title, category, description, image_url, project_url, is_highlighted, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, category || 'Web Development', description, image_url, project_url || '', is_highlighted ? 1 : 0, order_index || 0]
    );

    return NextResponse.json({ success: true, id: result.insertId, message: 'Project created successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { id, title, category, description, image_url, project_url, is_highlighted, order_index } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });

    await pool.execute(
      'UPDATE projects SET title = ?, category = ?, description = ?, image_url = ?, project_url = ?, is_highlighted = ?, order_index = ? WHERE id = ?',
      [title, category || 'Web Development', description, image_url, project_url || '', is_highlighted ? 1 : 0, order_index || 0, id]
    );

    return NextResponse.json({ success: true, message: 'Project updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await initDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });

    await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
