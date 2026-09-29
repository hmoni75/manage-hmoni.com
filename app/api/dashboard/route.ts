import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        await initDB();
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT metric_key, metric_value FROM dashboard_stats');

        const data: Record<string, any> = {};
        for (const row of rows) {
            try {
                data[row.metric_key] = JSON.parse(row.metric_value);
            } catch {
                data[row.metric_key] = row.metric_value;
            }
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json({ error: 'Failed to fetch site data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await initDB();
        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'key and value are required' }, { status: 400 });
        }

        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

        await pool.execute(
            'INSERT INTO dashboard_stats (metric_key, metric_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value)',
            [key, stringValue]
        );

        return NextResponse.json({ success: true, message: 'Data saved successfully to MySQL database' });
    } catch (error) {
        console.error('Error saving dashboard data:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}

