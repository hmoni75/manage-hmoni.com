import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool, { initDB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { verifyToken, signToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        await initDB();
        const token = cookies().get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch User Info (active records)
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT id, name, email, role, member_id, created_at FROM users WHERE id = ? AND deleted_at IS NULL',
            [decoded.id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = rows[0];

        // Try to match Member record by member_id first, then Email, then Name
        const [memberRows] = await pool.execute<RowDataPacket[]>(
            `SELECT 
                m.id,
                m.sl_no,
                m.name,
                m.email,
                m.joining_date,
                m.mobile,
                m.address,
                m.share_count,
                m.expected_amount,
                m.remarks,
                COALESCE(SUM(mi.deposit_amount), 0) as total_deposit,
                COALESCE(SUM(mi.penalty_amount), 0) as total_penalty,
                COALESCE(SUM(mi.deposit_amount + mi.penalty_amount), 0) as total_realized,
                (COALESCE(SUM(mi.deposit_amount + mi.penalty_amount), 0) - m.expected_amount) as surplus_deficit
            FROM members m
            LEFT JOIN member_installments mi ON m.id = mi.member_id AND mi.deleted_at IS NULL
            WHERE m.deleted_at IS NULL
              AND ((m.id = ?)
               OR (m.email IS NOT NULL AND m.email != '' AND LOWER(m.email) = LOWER(?))
               OR (LOWER(m.name) LIKE LOWER(?)))
            GROUP BY m.id
            ORDER BY (m.id = ?) DESC, (m.email IS NOT NULL AND LOWER(m.email) = LOWER(?)) DESC
            LIMIT 1`,
            [user.member_id || 0, user.email, `%${user.name}%`, user.member_id || 0, user.email]
        );

        let member = memberRows.length > 0 ? {
            ...memberRows[0],
            id: Number(memberRows[0].id),
            sl_no: Number(memberRows[0].sl_no || 0),
            share_count: Number(memberRows[0].share_count || 0),
            expected_amount: Number(memberRows[0].expected_amount || 0),
            total_deposit: Number(memberRows[0].total_deposit || 0),
            total_penalty: Number(memberRows[0].total_penalty || 0),
            total_realized: Number(memberRows[0].total_realized || 0),
            surplus_deficit: Number(memberRows[0].surplus_deficit || 0)
        } : null;

        let installments: any[] = [];

        if (member) {
            const [instRows] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM member_installments WHERE member_id = ? AND deleted_at IS NULL ORDER BY id ASC',
                [member.id]
            );
            installments = instRows.map((inst) => ({
                ...inst,
                id: Number(inst.id),
                member_id: Number(inst.member_id),
                deposit_amount: Number(inst.deposit_amount || 0),
                penalty_amount: Number(inst.penalty_amount || 0)
            }));
        }

        return NextResponse.json({
            success: true,
            user,
            member,
            installments
        });
    } catch (error: any) {
        console.error('Profile GET error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await initDB();
        const token = cookies().get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, currentPassword, newPassword } = body;

        // Fetch current user record from MySQL
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT id, name, email, password, role FROM users WHERE id = ?',
            [decoded.id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = rows[0];

        let updatedName = user.name;
        let updatedEmail = user.email;

        // 1. Update Name & Email if provided
        if (name && name.trim()) {
            updatedName = name.trim();
        }

        if (email && email.trim() && email.trim().toLowerCase() !== user.email) {
            const normalizedEmail = email.trim().toLowerCase();

            // Check if email taken by another user
            const [existing] = await pool.execute<RowDataPacket[]>(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [normalizedEmail, user.id]
            );

            if (existing.length > 0) {
                return NextResponse.json({ error: 'This email is already used by another user.' }, { status: 409 });
            }

            updatedEmail = normalizedEmail;
        }

        // 2. Password change logic
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password is required to set a new password.' }, { status: 400 });
            }

            if (newPassword.length < 6) {
                return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
            }

            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            await pool.execute(
                'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
                [updatedName, updatedEmail, hashedNewPassword, user.id]
            );
        } else {
            await pool.execute(
                'UPDATE users SET name = ?, email = ? WHERE id = ?',
                [updatedName, updatedEmail, user.id]
            );
        }

        // Generate fresh JWT token
        const newToken = await signToken({
            id: user.id,
            name: updatedName,
            email: updatedEmail,
            role: user.role
        });

        const response = NextResponse.json({
            success: true,
            user: { id: user.id, name: updatedName, email: updatedEmail, role: user.role },
            message: 'Profile updated successfully'
        });

        // Update HTTP-Only Cookie
        response.cookies.set('auth_token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        });

        return response;
    } catch (error: any) {
        console.error('Profile PUT error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update profile' }, { status: 500 });
    }
}
