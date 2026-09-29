import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await initDB();
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM stats ORDER BY id ASC');
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const { stat_key, label, number_value, suffix } = body;

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO stats (stat_key, label, number_value, suffix) VALUES (?, ?, ?, ?)',
            [stat_key || label.toLowerCase().replace(/\s+/g, '_'), label, number_value, suffix || '+']
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'Stat created' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const { id, stat_key, label, number_value, suffix } = body;

        if (!id) return NextResponse.json({ success: false, error: 'Stat ID is required' }, { status: 400 });

        await pool.execute(
            'UPDATE stats SET stat_key = ?, label = ?, number_value = ?, suffix = ? WHERE id = ?',
            [stat_key || label.toLowerCase().replace(/\s+/g, '_'), label, number_value, suffix || '+', id]
        );

        return NextResponse.json({ success: true, message: 'Stat updated' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await initDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'Stat ID is required' }, { status: 400 });

        await pool.execute('DELETE FROM stats WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Stat deleted' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
