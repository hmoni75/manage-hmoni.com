import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDB();
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM hero_slides ORDER BY order_index ASC, id DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { title, subtitle, button_text, button_link, image_url, order_index } = body;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO hero_slides (title, subtitle, button_text, button_link, image_url, order_index) VALUES (?, ?, ?, ?, ?, ?)',
      [title, subtitle || '', button_text || 'Explore More', button_link || '#projects', image_url, order_index || 0]
    );

    return NextResponse.json({ success: true, id: result.insertId, message: 'Hero slide created' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { id, title, subtitle, button_text, button_link, image_url, order_index } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Slide ID is required' }, { status: 400 });

    await pool.execute(
      'UPDATE hero_slides SET title = ?, subtitle = ?, button_text = ?, button_link = ?, image_url = ?, order_index = ? WHERE id = ?',
      [title, subtitle || '', button_text || 'Explore More', button_link || '#projects', image_url, order_index || 0, id]
    );

    return NextResponse.json({ success: true, message: 'Hero slide updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await initDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'Slide ID is required' }, { status: 400 });

    await pool.execute('DELETE FROM hero_slides WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Hero slide deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
