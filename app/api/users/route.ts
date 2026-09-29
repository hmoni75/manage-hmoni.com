import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool, { initDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';

async function checkAdminPermission() {
    const token = cookies().get('auth_token')?.value;
    if (!token) return false;
    const user = await verifyToken(token);
    return user?.role === 'admin';
}

export async function GET() {
    try {
        await initDB();

        const isAdmin = await checkAdminPermission();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Access Denied. Admin role required.' }, { status: 403 });
        }

        const [rows] = await pool.execute<RowDataPacket[]>(`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.role,
                u.member_id,
                u.created_at,
                m.sl_no as member_sl,
                m.name as member_name
            FROM users u
            LEFT JOIN members m ON (u.member_id = m.id OR LOWER(u.email) = LOWER(m.email)) AND m.deleted_at IS NULL
            WHERE u.deleted_at IS NULL
            ORDER BY u.id ASC
        `);

        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('Users GET API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch users' }, { status: 500 });
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
        const { name, email, password, role, member_id } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if email taken
        const [existing] = await pool.execute<RowDataPacket[]>(
            'SELECT id FROM users WHERE LOWER(email) = ?',
            [normalizedEmail]
        );

        if (existing.length > 0) {
            return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
        }

        const userPassword = password && password.trim() ? password.trim() : '123456';
        const hashedPassword = await bcrypt.hash(userPassword, 10);
        const userRole = role || 'member';

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO users (name, email, password, role, member_id) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), normalizedEmail, hashedPassword, userRole, member_id || null]
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'User created successfully' });
    } catch (error: any) {
        console.error('Users POST API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to create user' }, { status: 500 });
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
        const { id, name, email, role, password, member_id } = body;

        if (!id || !name || !email) {
            return NextResponse.json({ error: 'ID, Name and Email are required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check duplicate email for other users
        const [existing] = await pool.execute<RowDataPacket[]>(
            'SELECT id FROM users WHERE LOWER(email) = ? AND id != ?',
            [normalizedEmail, id]
        );

        if (existing.length > 0) {
            return NextResponse.json({ error: 'This email is used by another user' }, { status: 400 });
        }

        if (password && password.trim()) {
            const hashedPassword = await bcrypt.hash(password.trim(), 10);
            await pool.execute(
                'UPDATE users SET name = ?, email = ?, role = ?, password = ?, member_id = ? WHERE id = ?',
                [name.trim(), normalizedEmail, role || 'member', hashedPassword, member_id || null, id]
            );
        } else {
            await pool.execute(
                'UPDATE users SET name = ?, email = ?, role = ?, member_id = ? WHERE id = ?',
                [name.trim(), normalizedEmail, role || 'member', member_id || null, id]
            );
        }

        return NextResponse.json({ success: true, message: 'User updated successfully' });
    } catch (error: any) {
        console.error('Users PUT API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update user' }, { status: 500 });
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
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await pool.execute('UPDATE users SET deleted_at = NOW() WHERE id = ?', [id]);

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Users DELETE API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to delete user' }, { status: 500 });
    }
}
