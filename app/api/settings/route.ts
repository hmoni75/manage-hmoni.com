import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await initDB();
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM site_settings');
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const { setting_key, setting_value } = body;

        if (!setting_key) return NextResponse.json({ success: false, error: 'Setting key is required' }, { status: 400 });

        await pool.execute(
            'UPDATE site_settings SET setting_value = ? WHERE setting_key = ?',
            [setting_value, setting_key]
        );

        return NextResponse.json({ success: true, message: 'Setting updated' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
