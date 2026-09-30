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

    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        id, title, slug, excerpt, content,
        COALESCE(image_url, img, '') as cover_image,
        COALESCE(image_url, img, '') as image_url,
        COALESCE(author, 'HMoni Team') as author_name,
        COALESCE(author, 'HMoni Team') as author,
        category,
        tags,
        views,
        created_at as published_at,
        created_at
      FROM blogs 
      ORDER BY created_at DESC, id DESC
    `);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { title, slug, excerpt, content, cover_image, image_url, author_name, author, category } = body;
    const img = cover_image || image_url || '';
    const authorVal = author_name || author || 'HMoni Team';

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO blogs (title, slug, excerpt, content, image_url, author, category, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [title, generatedSlug, excerpt || '', content || '', img, authorVal, category || 'General']
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
    const { id, title, slug, excerpt, content, cover_image, image_url, author_name, author, category } = body;
    const img = cover_image || image_url || '';
    const authorVal = author_name || author || 'HMoni Team';

    if (!id) return NextResponse.json({ success: false, error: 'Blog ID is required' }, { status: 400 });
    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    await pool.execute(
      'UPDATE blogs SET title = ?, slug = ?, excerpt = ?, content = ?, image_url = ?, author = ?, category = ? WHERE id = ?',
      [title, generatedSlug, excerpt || '', content || '', img, authorVal, category || 'General', id]
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
