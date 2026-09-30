import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await initDB();
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM experiences WHERE deleted_at IS NULL ORDER BY sort_order ASC, id ASC'
        );
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('Experiences GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const { company, position, role, start_date, end_date, period, description, is_current, sort_order, designation, company_name } = body;

        const finalCompany = company || company_name || '';
        const finalPosition = position || role || designation || '';
        const finalPeriod = period || (start_date ? `${start_date} — ${end_date || 'Present'}` : '');

        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO experiences 
            (company, position, role, start_date, end_date, period, description, is_current, sort_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                finalCompany,
                finalPosition,
                finalPosition,
                start_date || '',
                end_date || (is_current ? 'Present' : ''),
                finalPeriod,
                description || '',
                is_current ? 1 : 0,
                Number(sort_order) || 0
            ]
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'Experience created' });
    } catch (error: any) {
        console.error('Experiences POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const { id, company, position, role, start_date, end_date, period, description, is_current, sort_order, designation, company_name } = body;

        if (!id) return NextResponse.json({ success: false, error: 'Experience ID is required' }, { status: 400 });

        const finalCompany = company || company_name || '';
        const finalPosition = position || role || designation || '';
        const finalPeriod = period || (start_date ? `${start_date} — ${end_date || 'Present'}` : '');

        await pool.execute(
            `UPDATE experiences SET 
            company = ?, position = ?, role = ?, start_date = ?, end_date = ?, period = ?, 
            description = ?, is_current = ?, sort_order = ? 
            WHERE id = ?`,
            [
                finalCompany,
                finalPosition,
                finalPosition,
                start_date || '',
                end_date || (is_current ? 'Present' : ''),
                finalPeriod,
                description || '',
                is_current ? 1 : 0,
                Number(sort_order) || 0,
                id
            ]
        );

        return NextResponse.json({ success: true, message: 'Experience updated' });
    } catch (error: any) {
        console.error('Experiences PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await initDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'Experience ID is required' }, { status: 400 });

        await pool.execute(
            'UPDATE experiences SET is_deleted = 1, isDelete = 1, deleted_at = NOW() WHERE id = ?',
            [id]
        );
        return NextResponse.json({ success: true, message: 'Experience deleted' });
    } catch (error: any) {
        console.error('Experiences DELETE error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
