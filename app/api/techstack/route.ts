import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM tech_stack ORDER BY sort_order ASC, id ASC');
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('TechStack GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, category, icon_url, proficiency, proficiency_level, sort_order } = body;

        const prof = Number(proficiency || proficiency_level) || 80;

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO tech_stack (name, category, icon_url, proficiency, sort_order) VALUES (?, ?, ?, ?, ?)',
            [name, category || 'Frontend', icon_url || '', prof, Number(sort_order) || 0]
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'Tech stack item created' });
    } catch (error: any) {
        console.error('TechStack POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, name, category, icon_url, proficiency, proficiency_level, sort_order } = body;

        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        const prof = Number(proficiency || proficiency_level) || 80;

        await pool.execute(
            'UPDATE tech_stack SET name = ?, category = ?, icon_url = ?, proficiency = ?, sort_order = ? WHERE id = ?',
            [name, category || 'Frontend', icon_url || '', prof, Number(sort_order) || 0, id]
        );

        return NextResponse.json({ success: true, message: 'Tech stack item updated' });
    } catch (error: any) {
        console.error('TechStack PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        await pool.execute('DELETE FROM tech_stack WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Tech stack item deleted' });
    } catch (error: any) {
        console.error('TechStack DELETE error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
