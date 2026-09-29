import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM faqs ORDER BY sort_order ASC, id ASC');
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('FAQs GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { question, answer, category, sort_order } = body;

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO faqs (question, answer, category, sort_order) VALUES (?, ?, ?, ?)',
            [question, answer, category || 'General', Number(sort_order) || 0]
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'FAQ created' });
    } catch (error: any) {
        console.error('FAQs POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, question, answer, category, sort_order } = body;

        if (!id) return NextResponse.json({ success: false, error: 'FAQ ID is required' }, { status: 400 });

        await pool.execute(
            'UPDATE faqs SET question = ?, answer = ?, category = ?, sort_order = ? WHERE id = ?',
            [question, answer, category || 'General', Number(sort_order) || 0, id]
        );

        return NextResponse.json({ success: true, message: 'FAQ updated' });
    } catch (error: any) {
        console.error('FAQs PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'FAQ ID is required' }, { status: 400 });

        await pool.execute('DELETE FROM faqs WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'FAQ deleted' });
    } catch (error: any) {
        console.error('FAQs DELETE error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
