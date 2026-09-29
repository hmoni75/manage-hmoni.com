import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        await initDB();

        // Total Deposits & Penalties from Installments of active members
        const [depRows] = await pool.execute<RowDataPacket[]>(`
            SELECT 
                COALESCE(SUM(COALESCE(mi.deposit_amount, 0)), 0) as total_deposit,
                COALESCE(SUM(COALESCE(mi.penalty_amount, 0)), 0) as total_penalty,
                COALESCE(SUM(COALESCE(mi.deposit_amount, 0) + COALESCE(mi.penalty_amount, 0)), 0) as total_realized
            FROM member_installments mi
            INNER JOIN members m ON mi.member_id = m.id AND m.deleted_at IS NULL
            WHERE mi.deleted_at IS NULL
        `);

        // Total Members, Shares, and Expected Amount from active Members
        const [memRows] = await pool.execute<RowDataPacket[]>(`
            SELECT 
                COUNT(*) as total_members,
                COALESCE(SUM(COALESCE(share_count, 0)), 0) as total_shares,
                COALESCE(SUM(COALESCE(expected_amount, 00.00)), 0) as total_expected
            FROM members 
            WHERE deleted_at IS NULL
        `);

        // Total Expenses from Expenses (active records)
        const [expRows] = await pool.execute<RowDataPacket[]>(`
            SELECT 
                COALESCE(SUM(COALESCE(amount, 0)), 0) as total_expenses 
            FROM expenses 
            WHERE deleted_at IS NULL
        `);

        const totalDeposit = Number(depRows[0]?.total_deposit || 0);
        const totalPenalty = Number(depRows[0]?.total_penalty || 0);
        const totalRealized = Number(depRows[0]?.total_realized || 0);

        const totalMembers = Number(memRows[0]?.total_members || 0);
        const totalShares = Number(memRows[0]?.total_shares || 0);
        const totalExpected = Number(memRows[0]?.total_expected || 0);

        const totalExpenses = Number(expRows[0]?.total_expenses || 0);

        const netBalance = totalRealized - totalExpenses;
        const totalSurplusDeficit = totalRealized - totalExpected;

        return NextResponse.json(
            {
                success: true,
                data: {
                    totalMembers,
                    totalShares,
                    totalExpected,
                    totalDeposit,
                    totalPenalty,
                    totalRealized,
                    totalExpenses,
                    netBalance,
                    totalSurplusDeficit
                }
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                }
            }
        );
    } catch (error: any) {
        console.error('Summary API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch summary' }, { status: 500 });
    }
}
