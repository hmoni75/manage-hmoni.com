import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await initDB();
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM tech_stack WHERE deleted_at IS NULL ORDER BY sort_order ASC, id ASC'
        );
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('TechStack GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const { name, title, category, tags, tags_json, icon_url, image_url, thumb, score, proficiency, proficiency_level, sort_order } = body;

        const finalTitle = title || name || category || '';
        const finalCategory = category || finalTitle || 'Development';
        const finalScore = Number(score ?? proficiency ?? proficiency_level) || 80;
        const finalImage = image_url || thumb || icon_url || '';
        const finalTags = tags || (Array.isArray(tags_json) ? tags_json.join(', ') : '');
        const finalTagsJson = Array.isArray(tags_json)
            ? JSON.stringify(tags_json)
            : JSON.stringify(finalTags ? finalTags.split(',').map((t: string) => t.trim()).filter(Boolean) : []);

        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO tech_stack 
            (name, title, category, tags, tags_json, icon_url, image_url, thumb, proficiency, score, sort_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                finalTitle,
                finalTitle,
                finalCategory,
                finalTags,
                finalTagsJson,
                finalImage,
                finalImage,
                finalImage,
                finalScore,
                finalScore,
                Number(sort_order) || 0
            ]
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'Tech stack card created' });
    } catch (error: any) {
        console.error('TechStack POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const { id, name, title, category, tags, tags_json, icon_url, image_url, thumb, score, proficiency, proficiency_level, sort_order } = body;

        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        const finalTitle = title || name || category || '';
        const finalCategory = category || finalTitle || 'Development';
        const finalScore = Number(score ?? proficiency ?? proficiency_level) || 80;
        const finalImage = image_url || thumb || icon_url || '';
        const finalTags = tags || (Array.isArray(tags_json) ? tags_json.join(', ') : '');
        const finalTagsJson = Array.isArray(tags_json)
            ? JSON.stringify(tags_json)
            : JSON.stringify(finalTags ? finalTags.split(',').map((t: string) => t.trim()).filter(Boolean) : []);

        await pool.execute(
            `UPDATE tech_stack SET 
            name = ?, title = ?, category = ?, tags = ?, tags_json = ?, 
            icon_url = ?, image_url = ?, thumb = ?, proficiency = ?, score = ?, sort_order = ? 
            WHERE id = ?`,
            [
                finalTitle,
                finalTitle,
                finalCategory,
                finalTags,
                finalTagsJson,
                finalImage,
                finalImage,
                finalImage,
                finalScore,
                finalScore,
                Number(sort_order) || 0,
                id
            ]
        );

        return NextResponse.json({ success: true, message: 'Tech stack card updated' });
    } catch (error: any) {
        console.error('TechStack PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await initDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        await pool.execute(
            'UPDATE tech_stack SET is_deleted = 1, isDelete = 1, deleted_at = NOW() WHERE id = ?',
            [id]
        );
        return NextResponse.json({ success: true, message: 'Tech stack card deleted' });
    } catch (error: any) {
        console.error('TechStack DELETE error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

