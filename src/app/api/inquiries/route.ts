import { NextResponse } from 'next/server';
import { createInquiry, getDbPool, MOCK_INQUIRIES } from '@/lib/db';

export async function GET() {
  const pool = getDbPool();
  if (pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM inquiries ORDER BY id DESC');
      return NextResponse.json({ success: true, inquiries: rows });
    } catch (error: any) {
      return NextResponse.json({ success: true, inquiries: MOCK_INQUIRIES, error: error.message });
    }
  }
  return NextResponse.json({ success: true, inquiries: MOCK_INQUIRIES });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { applicant_name, phone, email, plot_id, message } = body;

    if (!applicant_name || !phone) {
      return NextResponse.json({ success: false, message: 'Name and Phone are required' }, { status: 400 });
    }

    const result = await createInquiry({
      applicant_name,
      phone,
      email,
      plot_id: plot_id ? Number(plot_id) : null,
      message,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
