import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM experiences WHERE deleted_at IS NULL ORDER BY sort_order ASC, id ASC');
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('Experiences GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { company, position, start_date, end_date, description, is_current, sort_order, designation, company_name } = body;

        const finalCompany = company || company_name || '';
        const finalPosition = position || designation || '';

        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO experiences 
            (company, position, start_date, end_date, description, is_current, sort_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [finalCompany, finalPosition, start_date || '', end_date || 'Present', description || '', is_current ? 1 : 0, Number(sort_order) || 0]
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'Experience created' });
    } catch (error: any) {
        console.error('Experiences POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, company, position, start_date, end_date, description, is_current, sort_order, designation, company_name } = body;

        if (!id) return NextResponse.json({ success: false, error: 'Experience ID is required' }, { status: 400 });

        const finalCompany = company || company_name || '';
        const finalPosition = position || designation || '';

        await pool.execute(
            `UPDATE experiences SET 
            company = ?, position = ?, start_date = ?, end_date = ?, description = ?, is_current = ?, sort_order = ? 
            WHERE id = ?`,
            [finalCompany, finalPosition, start_date || '', end_date || 'Present', description || '', is_current ? 1 : 0, Number(sort_order) || 0, id]
        );

        return NextResponse.json({ success: true, message: 'Experience updated' });
    } catch (error: any) {
        console.error('Experiences PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'Experience ID is required' }, { status: 400 });

        await pool.execute('UPDATE experiences SET is_deleted = 1, isDelete = 1, deleted_at = NOW() WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Experience deleted' });
    } catch (error: any) {
        console.error('Experiences DELETE error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
