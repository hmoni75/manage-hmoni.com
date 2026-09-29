import { NextResponse } from 'next/server';
import { getNotices, getDbPool, MOCK_NOTICES } from '@/lib/db';

export async function GET() {
  const result = await getNotices();
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, category, is_urgent } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, message: 'Title and content are required' }, { status: 400 });
    }

    const pool = getDbPool();
    if (pool) {
      const [res]: any = await pool.query(
        'INSERT INTO notices (title, content, category, is_urgent) VALUES (?, ?, ?, ?)',
        [title, content, category || 'General', is_urgent ? 1 : 0]
      );
      return NextResponse.json({ success: true, id: res.insertId, isConnectedToDb: true });
    }

    // Mock fallback insert
    const newNotice = {
      id: MOCK_NOTICES.length + 1,
      title,
      content,
      category: category || 'General',
      is_urgent: is_urgent ? 1 : 0,
      published_at: new Date().toISOString(),
    };
    MOCK_NOTICES.unshift(newNotice);

    return NextResponse.json({ success: true, id: newNotice.id, isConnectedToDb: false, notice: newNotice });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
