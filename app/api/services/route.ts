import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM services ORDER BY sort_order ASC, id ASC');
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('Services GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, icon, sort_order, desc_text, num } = body;

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO services (title, description, icon, sort_order, desc_text, num) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description || desc_text || '', icon || 'pi-code', Number(sort_order) || 0, desc_text || description || '', num || '']
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'Service created' });
    } catch (error: any) {
        console.error('Services POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, title, description, icon, sort_order, desc_text, num } = body;

        if (!id) return NextResponse.json({ success: false, error: 'Service ID is required' }, { status: 400 });

        await pool.execute(
            'UPDATE services SET title = ?, description = ?, icon = ?, sort_order = ?, desc_text = ?, num = ? WHERE id = ?',
            [title, description || desc_text || '', icon || 'pi-code', Number(sort_order) || 0, desc_text || description || '', num || '', id]
        );

        return NextResponse.json({ success: true, message: 'Service updated' });
    } catch (error: any) {
        console.error('Services PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'Service ID is required' }, { status: 400 });

        await pool.execute('DELETE FROM services WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Service deleted' });
    } catch (error: any) {
        console.error('Services DELETE error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
