import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool, { initDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';

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

        const [rows] = await pool.execute<RowDataPacket[]>(`
            SELECT 
                m.id,
                m.sl_no,
                m.name,
                m.email,
                m.joining_date,
                m.mobile,
                m.address,
                COALESCE(m.share_count, 1) as share_count,
                COALESCE(m.expected_amount, 00.00) as expected_amount,
                m.remarks,
                COALESCE(SUM(mi.deposit_amount), 0) as total_deposit,
                COALESCE(SUM(mi.penalty_amount), 0) as total_penalty,
                COALESCE(SUM(mi.deposit_amount + mi.penalty_amount), 0) as total_realized,
                (COALESCE(SUM(mi.deposit_amount + mi.penalty_amount), 0) - COALESCE(m.expected_amount, 00.00)) as surplus_deficit
            FROM members m
            LEFT JOIN member_installments mi ON m.id = mi.member_id AND mi.deleted_at IS NULL
            WHERE m.deleted_at IS NULL
            GROUP BY m.id
            ORDER BY m.sl_no ASC
        `);

        const formattedRows = rows.map((m) => ({
            ...m,
            id: Number(m.id),
            sl_no: Number(m.sl_no || 0),
            share_count: Number(m.share_count || 0),
            expected_amount: Number(m.expected_amount || 0),
            total_deposit: Number(m.total_deposit || 0),
            total_penalty: Number(m.total_penalty || 0),
            total_realized: Number(m.total_realized || 0),
            surplus_deficit: Number(m.surplus_deficit || 0)
        }));

        return NextResponse.json({ success: true, data: formattedRows });
    } catch (error: any) {
        console.error('Members GET API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch members' }, { status: 500 });
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
        const { sl_no, name, email, joining_date, mobile, address, share_count, expected_amount, remarks } = body;

        if (!name) {
            return NextResponse.json({ error: 'Member name is required' }, { status: 400 });
        }

        const shares = Number(share_count) || 1;
        const expected = Number(expected_amount) || shares * 0;
        const normalizedEmail = email ? email.trim().toLowerCase() : '';

        let finalSlNo = Number(sl_no);
        if (!finalSlNo || finalSlNo <= 0) {
            const [maxRows] = await pool.execute<RowDataPacket[]>(
                'SELECT COALESCE(MAX(sl_no), 0) + 1 as next_sl FROM members WHERE deleted_at IS NULL'
            );
            finalSlNo = Number(maxRows[0]?.next_sl || 1);
        }

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO members (sl_no, name, email, joining_date, mobile, address, share_count, expected_amount, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [finalSlNo, name.trim(), normalizedEmail, joining_date || '', mobile || '', address || '', shares, expected, remarks || '']
        );

        const memberId = result.insertId;

        // Auto Create or Link User Account if email is provided
        if (normalizedEmail) {
            const [existingUsers] = await pool.execute<RowDataPacket[]>(
                'SELECT id FROM users WHERE LOWER(email) = ?',
                [normalizedEmail]
            );

            if (existingUsers.length === 0) {
                const hashedPassword = await bcrypt.hash('123456', 10);
                await pool.execute(
                    'INSERT INTO users (name, email, password, role, member_id) VALUES (?, ?, ?, ?, ?)',
                    [name.trim(), normalizedEmail, hashedPassword, 'member', memberId]
                );
            } else {
                await pool.execute(
                    'UPDATE users SET member_id = ?, name = ?, role = IF(role = "admin", "admin", "member") WHERE LOWER(email) = ?',
                    [memberId, name.trim(), normalizedEmail]
                );
            }
        }

        return NextResponse.json({ success: true, id: memberId, message: 'Member created successfully' });
    } catch (error: any) {
        console.error('Members POST API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to create member' }, { status: 500 });
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
        const { id, sl_no, name, email, joining_date, mobile, address, share_count, expected_amount, remarks } = body;

        if (!id || !name) {
            return NextResponse.json({ error: 'Member ID and name are required' }, { status: 400 });
        }

        // Fetch existing member to check previous email
        const [oldMemberRows] = await pool.execute<RowDataPacket[]>(
            'SELECT name, email FROM members WHERE id = ?',
            [id]
        );

        const oldEmail = oldMemberRows.length > 0 && oldMemberRows[0].email ? oldMemberRows[0].email.trim().toLowerCase() : '';
        const shares = Number(share_count) || 1;
        const expected = Number(expected_amount) || shares * 0;
        const normalizedEmail = email ? email.trim().toLowerCase() : '';

        // Update Member record in DB
        await pool.execute(
            'UPDATE members SET sl_no = ?, name = ?, email = ?, joining_date = ?, mobile = ?, address = ?, share_count = ?, expected_amount = ?, remarks = ? WHERE id = ?',
            [sl_no, name.trim(), normalizedEmail, joining_date || '', mobile || '', address || '', shares, expected, remarks || '', id]
        );

        // User Account Synchronization
        if (oldEmail && oldEmail !== normalizedEmail) {
            // Check if user exists with oldEmail
            const [usersWithOldEmail] = await pool.execute<RowDataPacket[]>(
                'SELECT id FROM users WHERE LOWER(email) = ?',
                [oldEmail]
            );

            if (usersWithOldEmail.length > 0) {
                // Update existing user account email, name, and member_id in-place
                if (normalizedEmail) {
                    await pool.execute(
                        'UPDATE users SET email = ?, name = ?, member_id = ?, role = IF(role = "admin", "admin", "member") WHERE LOWER(email) = ?',
                        [normalizedEmail, name.trim(), id, oldEmail]
                    );
                }
            } else if (normalizedEmail) {
                // If no user existed for oldEmail, check new email
                const [usersWithNewEmail] = await pool.execute<RowDataPacket[]>(
                    'SELECT id FROM users WHERE LOWER(email) = ?',
                    [normalizedEmail]
                );

                if (usersWithNewEmail.length === 0) {
                    const hashedPassword = await bcrypt.hash('123456', 10);
                    await pool.execute(
                        'INSERT INTO users (name, email, password, role, member_id) VALUES (?, ?, ?, ?, ?)',
                        [name.trim(), normalizedEmail, hashedPassword, 'member', id]
                    );
                } else {
                    await pool.execute(
                        'UPDATE users SET member_id = ?, name = ?, role = IF(role = "admin", "admin", "member") WHERE LOWER(email) = ?',
                        [id, name.trim(), normalizedEmail]
                    );
                }
            }
        } else if (normalizedEmail) {
            // Email is unchanged, check if user exists for this email
            const [usersWithNewEmail] = await pool.execute<RowDataPacket[]>(
                'SELECT id FROM users WHERE LOWER(email) = ?',
                [normalizedEmail]
            );

            if (usersWithNewEmail.length > 0) {
                // Synchronize name and member_id on existing user account
                await pool.execute(
                    'UPDATE users SET name = ?, member_id = ?, role = IF(role = "admin", "admin", "member") WHERE LOWER(email) = ?',
                    [name.trim(), id, normalizedEmail]
                );
            } else {
                // Create user account if missing
                const hashedPassword = await bcrypt.hash('123456', 10);
                await pool.execute(
                    'INSERT INTO users (name, email, password, role, member_id) VALUES (?, ?, ?, ?, ?)',
                    [name.trim(), normalizedEmail, hashedPassword, 'member', id]
                );
            }
        }

        return NextResponse.json({ success: true, message: 'Member updated successfully' });
    } catch (error: any) {
        console.error('Members PUT API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update member' }, { status: 500 });
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
            return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
        }

        await pool.execute('UPDATE members SET deleted_at = NOW() WHERE id = ?', [id]);
        await pool.execute('UPDATE member_installments SET deleted_at = NOW() WHERE member_id = ?', [id]);
        await pool.execute('UPDATE users SET deleted_at = NOW() WHERE member_id = ?', [id]);

        return NextResponse.json({ success: true, message: 'Member deleted successfully' });
    } catch (error: any) {
        console.error('Members DELETE API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to delete member' }, { status: 500 });
    }
}
