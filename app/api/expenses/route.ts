import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool, { initDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function checkAdminPermission() {
    const token = cookies().get('auth_token')?.value;
    if (!token) return false;
    const user = await verifyToken(token);
    return user?.role === 'admin';
}

async function checkAuthUser() {
    const token = cookies().get('auth_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function GET() {
    try {
        await initDB();

        const user = await checkAuthUser();
        if (!user || (user.role !== 'admin' && user.role !== 'member')) {
            return NextResponse.json({ error: 'Access Denied. Approved account required.' }, { status: 403 });
        }

        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM expenses WHERE deleted_at IS NULL ORDER BY sl_no DESC, id DESC');

        const formattedRows = rows.map((e) => ({
            ...e,
            id: Number(e.id),
            sl_no: Number(e.sl_no || 0),
            amount: Number(e.amount || 0)
        }));

        return NextResponse.json({ success: true, data: formattedRows });
    } catch (error: any) {
        console.error('Expenses GET API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch expenses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await initDB();
        const isAdmin = await checkAdminPermission();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Access Denied. Admin role required.' }, { status: 403 });
        }

        const body = await request.json();
        const { sl_no, expense_title, location, payment_method, expense_date, amount, remarks } = body;

        if (!expense_title || amount === undefined) {
            return NextResponse.json({ error: 'Expense title and amount are required' }, { status: 400 });
        }

        let finalSlNo = Number(sl_no);
        if (!finalSlNo || finalSlNo <= 0) {
            const [maxRows] = await pool.execute<RowDataPacket[]>(
                'SELECT COALESCE(MAX(sl_no), 0) + 1 as next_sl FROM expenses WHERE deleted_at IS NULL'
            );
            finalSlNo = Number(maxRows[0]?.next_sl || 1);
        }

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO expenses (sl_no, expense_title, location, payment_method, expense_date, amount, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                finalSlNo,
                expense_title.trim(),
                location || '',
                payment_method || 'Check',
                expense_date || null,
                Number(amount) || 0,
                remarks || ''
            ]
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'Expense record created' });
    } catch (error: any) {
        console.error('Expenses POST API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to create expense' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await initDB();
        const isAdmin = await checkAdminPermission();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Access Denied. Admin role required.' }, { status: 403 });
        }

        const body = await request.json();
        const { id, sl_no, expense_title, location, payment_method, expense_date, amount, remarks } = body;

        if (!id || !expense_title) {
            return NextResponse.json({ error: 'Expense ID and title are required' }, { status: 400 });
        }

        await pool.execute(
            'UPDATE expenses SET sl_no = ?, expense_title = ?, location = ?, payment_method = ?, expense_date = ?, amount = ?, remarks = ? WHERE id = ?',
            [
                Number(sl_no),
                expense_title.trim(),
                location,
                payment_method,
                expense_date || null,
                Number(amount) || 0,
                remarks,
                id
            ]
        );

        return NextResponse.json({ success: true, message: 'Expense record updated' });
    } catch (error: any) {
        console.error('Expenses PUT API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update expense' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await initDB();
        const isAdmin = await checkAdminPermission();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Access Denied. Admin role required.' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
        }

        await pool.execute('UPDATE expenses SET deleted_at = NOW() WHERE id = ?', [id]);

        return NextResponse.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error: any) {
        console.error('Expenses DELETE API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to delete expense' }, { status: 500 });
    }
}
