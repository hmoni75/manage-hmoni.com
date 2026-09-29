import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
    try {
        await initDB();
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Fetch active user from MySQL database
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT id, name, email, password, role FROM users WHERE email = ? AND deleted_at IS NULL',
            [normalizedEmail]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
        }

        const user = rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
        }

        // Generate JWT token
        const token = await signToken({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });

        const response = NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

        // Set HTTP-Only Cookie
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: error?.message || 'Database error occurred during login.' },
            { status: 500 }
        );
    }
}
