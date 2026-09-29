import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
    try {
        await initDB();
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'All fields (Name, Email, Password) are required.' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const [existingUsers] = await pool.execute<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ?',
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 });
        }

        // Hash password securely
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into MySQL with default 'user' role
        const role = 'user';
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name.trim(), normalizedEmail, hashedPassword, role]
        );

        const userId = result.insertId;

        // Generate JWT token
        const token = await signToken({
            id: userId,
            name: name.trim(),
            email: normalizedEmail,
            role
        });

        const response = NextResponse.json(
            { success: true, user: { id: userId, name: name.trim(), email: normalizedEmail, role } },
            { status: 201 }
        );

        // Set HTTP-Only Cookie for Security
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: error?.message || 'Database error occurred during registration.' },
            { status: 500 }
        );
    }
}
