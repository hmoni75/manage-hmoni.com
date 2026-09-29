import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await initDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (id) {
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM blogs WHERE id = ?', [id]);
      if (rows.length === 0) return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: rows[0] });
    }

    if (slug) {
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM blogs WHERE slug = ?', [slug]);
      if (rows.length === 0) return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: rows[0] });
    }

    const [rows] = await pool.execute<RowDataPacket[]>('SELECT id, title, slug, excerpt, cover_image, author_name, read_time, published_at FROM blogs ORDER BY published_at DESC, id DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { title, slug, excerpt, content, cover_image, author_name, read_time } = body;

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO blogs (title, slug, excerpt, content, cover_image, author_name, read_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, generatedSlug, excerpt, content, cover_image || '', author_name || 'HMoni Team', read_time || '5 min read']
    );

    return NextResponse.json({ success: true, id: result.insertId, slug: generatedSlug, message: 'Blog post created' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { id, title, slug, excerpt, content, cover_image, author_name, read_time } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Blog ID is required' }, { status: 400 });
    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    await pool.execute(
      'UPDATE blogs SET title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?, author_name = ?, read_time = ? WHERE id = ?',
      [title, generatedSlug, excerpt, content, cover_image || '', author_name || 'HMoni Team', read_time || '5 min read', id]
    );

    return NextResponse.json({ success: true, message: 'Blog post updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await initDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'Blog ID is required' }, { status: 400 });

    await pool.execute('DELETE FROM blogs WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Blog post deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
