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
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM blogs WHERE id = ? AND deleted_at IS NULL', [id]);
      if (rows.length === 0) return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: rows[0] });
    }

    if (slug) {
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM blogs WHERE slug = ? AND deleted_at IS NULL', [slug]);
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
        author_avatar,
        category,
        date_str,
        tags,
        gallery_img1,
        gallery_img2,
        banner_img,
        banner_caption,
        section1_title,
        section1_desc,
        section2_title,
        section2_desc,
        details_json,
        is_published,
        views,
        created_at as published_at,
        created_at
      FROM blogs 
      WHERE deleted_at IS NULL
      ORDER BY id DESC
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
    const {
      title,
      slug,
      excerpt,
      content,
      cover_image,
      image_url,
      author_name,
      author,
      author_avatar,
      category,
      date_str,
      tags,
      gallery_img1,
      gallery_img2,
      banner_img,
      banner_caption,
      section1_title,
      section1_desc,
      section2_title,
      section2_desc,
      details_json,
      is_published
    } = body;

    const img = cover_image || image_url || '';
    const authorVal = author_name || author || 'HMoni Team';
    const generatedSlug = slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `blog-${Date.now()}`);

    const detailsObj = details_json || {
      author_avatar,
      gallery_img1,
      gallery_img2,
      banner_img,
      banner_caption,
      section1_title,
      section1_desc,
      section2_title,
      section2_desc
    };

    const detailsStr = typeof detailsObj === 'string' ? detailsObj : JSON.stringify(detailsObj);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO blogs (
        title, slug, excerpt, content, image_url, img, author, author_avatar, 
        category, date_str, tags, gallery_img1, gallery_img2, banner_img, banner_caption, 
        section1_title, section1_desc, section2_title, section2_desc, details_json, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        generatedSlug,
        excerpt || '',
        content || '',
        img,
        img,
        authorVal,
        author_avatar || '',
        category || 'The World is Changing',
        date_str || 'Just now',
        tags || '',
        gallery_img1 || '',
        gallery_img2 || '',
        banner_img || '',
        banner_caption || '',
        section1_title || '',
        section1_desc || '',
        section2_title || '',
        section2_desc || '',
        detailsStr,
        is_published ?? 1
      ]
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
    const {
      id,
      title,
      slug,
      excerpt,
      content,
      cover_image,
      image_url,
      author_name,
      author,
      author_avatar,
      category,
      date_str,
      tags,
      gallery_img1,
      gallery_img2,
      banner_img,
      banner_caption,
      section1_title,
      section1_desc,
      section2_title,
      section2_desc,
      details_json,
      is_published
    } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Blog ID is required' }, { status: 400 });

    const img = cover_image || image_url || '';
    const authorVal = author_name || author || 'HMoni Team';
    const generatedSlug = slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `blog-${Date.now()}`);

    const detailsObj = details_json || {
      author_avatar,
      gallery_img1,
      gallery_img2,
      banner_img,
      banner_caption,
      section1_title,
      section1_desc,
      section2_title,
      section2_desc
    };

    const detailsStr = typeof detailsObj === 'string' ? detailsObj : JSON.stringify(detailsObj);

    await pool.execute(
      `UPDATE blogs SET 
        title = ?, slug = ?, excerpt = ?, content = ?, image_url = ?, img = ?, 
        author = ?, author_avatar = ?, category = ?, date_str = ?, tags = ?, 
        gallery_img1 = ?, gallery_img2 = ?, banner_img = ?, banner_caption = ?, 
        section1_title = ?, section1_desc = ?, section2_title = ?, section2_desc = ?, 
        details_json = ?, is_published = ? 
      WHERE id = ?`,
      [
        title,
        generatedSlug,
        excerpt || '',
        content || '',
        img,
        img,
        authorVal,
        author_avatar || '',
        category || 'The World is Changing',
        date_str || 'Just now',
        tags || '',
        gallery_img1 || '',
        gallery_img2 || '',
        banner_img || '',
        banner_caption || '',
        section1_title || '',
        section1_desc || '',
        section2_title || '',
        section2_desc || '',
        detailsStr,
        is_published ?? 1,
        id
      ]
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

    await pool.execute('UPDATE blogs SET is_deleted = 1, isDelete = 1, deleted_at = NOW() WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Blog post deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

