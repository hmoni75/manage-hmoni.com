import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(`
            SELECT 
                id, 
                title, 
                COALESCE(description, desc_text, '') as description, 
                COALESCE(desc_text, description, '') as desc_text, 
                icon, 
                sort_order, 
                num, 
                tags_json, 
                delay, 
                created_at, 
                updated_at 
            FROM services 
            WHERE deleted_at IS NULL 
            ORDER BY sort_order ASC, id ASC
        `);
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('Services GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, icon, sort_order, desc_text, num, tags, tags_json, delay } = body;

        let parsedTagsJson = tags_json;
        if (!parsedTagsJson && tags !== undefined) {
            const arr = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim()).filter(Boolean);
            parsedTagsJson = JSON.stringify(arr);
        } else if (Array.isArray(tags_json)) {
            parsedTagsJson = JSON.stringify(tags_json);
        }

        const desc = description || desc_text || '';

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO services (title, description, icon, sort_order, desc_text, num, tags_json, delay) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, desc, icon || 'pi-code', Number(sort_order) || 0, desc, num || '01', parsedTagsJson || '[]', delay || '0.05']
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'Service created' });
    } catch (error: any) {
        console.error('Services POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, title, description, icon, sort_order, desc_text, num, tags, tags_json, delay } = body;

        if (!id) return NextResponse.json({ success: false, error: 'Service ID is required' }, { status: 400 });

        let parsedTagsJson = tags_json;
        if (!parsedTagsJson && tags !== undefined) {
            const arr = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim()).filter(Boolean);
            parsedTagsJson = JSON.stringify(arr);
        } else if (Array.isArray(tags_json)) {
            parsedTagsJson = JSON.stringify(tags_json);
        }

        const desc = description || desc_text || '';

        await pool.execute(
            'UPDATE services SET title = ?, description = ?, icon = ?, sort_order = ?, desc_text = ?, num = ?, tags_json = ?, delay = ? WHERE id = ?',
            [title, desc, icon || 'pi-code', Number(sort_order) || 0, desc, num || '01', parsedTagsJson || '[]', delay || '0.05', id]
        );

        return NextResponse.json({ success: true, message: 'Service updated' });
    } catch (error: any) {
        console.error('Services PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'Service ID is required' }, { status: 400 });

        await pool.execute('UPDATE services SET is_deleted = 1, isDelete = 1, deleted_at = NOW() WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Service deleted' });
    } catch (error: any) {
        console.error('Services DELETE error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
