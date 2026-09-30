import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await initDB();
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM testimonials WHERE deleted_at IS NULL ORDER BY id ASC'
        );
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('Testimonials GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const { client_name, client_title, content, rating, image_url, company, author, role, avatar, project, stars } = body;

        const finalName = client_name || author || '';
        const finalProject = project || company || '';
        const finalTitle = client_title || role || '';
        const finalImage = image_url || avatar || '';
        const finalRating = Number(rating ?? stars) || 5;

        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO testimonials 
            (client_name, client_title, content, rating, image_url, company, author, role, avatar, project, stars) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [finalName, finalTitle, content || '', finalRating, finalImage, finalProject, finalName, finalTitle, finalImage, finalProject, finalRating]
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'Testimonial created' });
    } catch (error: any) {
        console.error('Testimonials POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const { id, client_name, client_title, content, rating, image_url, company, author, role, avatar, project, stars } = body;

        if (!id) return NextResponse.json({ success: false, error: 'Testimonial ID is required' }, { status: 400 });

        const finalName = client_name || author || '';
        const finalProject = project || company || '';
        const finalTitle = client_title || role || '';
        const finalImage = image_url || avatar || '';
        const finalRating = Number(rating ?? stars) || 5;

        await pool.execute(
            `UPDATE testimonials SET 
            client_name = ?, client_title = ?, content = ?, rating = ?, image_url = ?, 
            company = ?, author = ?, role = ?, avatar = ?, project = ?, stars = ? 
            WHERE id = ?`,
            [finalName, finalTitle, content || '', finalRating, finalImage, finalProject, finalName, finalTitle, finalImage, finalProject, finalRating, id]
        );

        return NextResponse.json({ success: true, message: 'Testimonial updated' });
    } catch (error: any) {
        console.error('Testimonials PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await initDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'Testimonial ID is required' }, { status: 400 });

        await pool.execute('UPDATE testimonials SET is_deleted = 1, isDelete = 1, deleted_at = NOW() WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Testimonial deleted' });
    } catch (error: any) {
        console.error('Testimonials DELETE error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
