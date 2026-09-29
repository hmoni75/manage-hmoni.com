import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { toMonthName } from '@/lib/date';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        await initDB();
        const { searchParams } = new URL(request.url);
        const member_id = searchParams.get('member_id');

        let query = 'SELECT * FROM member_installments WHERE deleted_at IS NULL';
        const params: any[] = [];

        if (member_id) {
            query += ' AND member_id = ?';
            params.push(member_id);
        }

        query += ' ORDER BY id ASC';

        const [rows] = await pool.execute<RowDataPacket[]>(query, params);

        const formattedRows = rows.map((inst) => ({
            ...inst,
            id: Number(inst.id),
            member_id: Number(inst.member_id),
            deposit_amount: Number(inst.deposit_amount || 0),
            penalty_amount: Number(inst.penalty_amount || 0)
        }));

        return NextResponse.json({ success: true, data: formattedRows });
    } catch (error: any) {
        console.error('Installments GET API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch installments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await initDB();
        const body = await request.json();
        const { member_id, installment_type, month_name, deposit_date, deposit_amount, penalty_amount, remarks } = body;

        if (!member_id || !installment_type) {
            return NextResponse.json({ error: 'Member ID and Installment Type are required' }, { status: 400 });
        }

        const derivedMonth = (month_name && month_name.trim()) ? month_name.trim() : toMonthName(deposit_date);

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO member_installments (member_id, installment_type, month_name, deposit_date, deposit_amount, penalty_amount, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                member_id,
                installment_type,
                derivedMonth,
                deposit_date || null,
                Number(deposit_amount) || 0,
                Number(penalty_amount) || 0,
                remarks || ''
            ]
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'Installment record added' });
    } catch (error: any) {
        console.error('Installments POST API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to add installment' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await initDB();
        const body = await request.json();
        const { id, installment_type, month_name, deposit_date, deposit_amount, penalty_amount, remarks } = body;

        if (!id) {
            return NextResponse.json({ error: 'Installment ID is required' }, { status: 400 });
        }

        const derivedMonth = (month_name && month_name.trim()) ? month_name.trim() : toMonthName(deposit_date);

        await pool.execute(
            'UPDATE member_installments SET installment_type = ?, month_name = ?, deposit_date = ?, deposit_amount = ?, penalty_amount = ?, remarks = ? WHERE id = ?',
            [
                installment_type,
                derivedMonth,
                deposit_date || null,
                Number(deposit_amount) || 0,
                Number(penalty_amount) || 0,
                remarks,
                id
            ]
        );

        return NextResponse.json({ success: true, message: 'Installment updated successfully' });
    } catch (error: any) {
        console.error('Installments PUT API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update installment' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await initDB();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Installment ID is required' }, { status: 400 });
        }

        await pool.execute('UPDATE member_installments SET deleted_at = NOW() WHERE id = ?', [id]);

        return NextResponse.json({ success: true, message: 'Installment deleted successfully' });
    } catch (error: any) {
        console.error('Installments DELETE API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to delete installment' }, { status: 500 });
    }
}
