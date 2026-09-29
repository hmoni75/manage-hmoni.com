import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM testimonials ORDER BY id ASC');
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('Testimonials GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { client_name, client_title, content, rating, image_url, company, author, role, avatar } = body;

        const finalName = client_name || author || '';
        const finalTitle = client_title || role || '';
        const finalImage = image_url || avatar || '';

        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO testimonials 
            (client_name, client_title, content, rating, image_url, company, author, role, avatar) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [finalName, finalTitle, content || '', Number(rating) || 5, finalImage, company || '', finalName, finalTitle, finalImage]
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'Testimonial created' });
    } catch (error: any) {
        console.error('Testimonials POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, client_name, client_title, content, rating, image_url, company, author, role, avatar } = body;

        if (!id) return NextResponse.json({ success: false, error: 'Testimonial ID is required' }, { status: 400 });

        const finalName = client_name || author || '';
        const finalTitle = client_title || role || '';
        const finalImage = image_url || avatar || '';

        await pool.execute(
            `UPDATE testimonials SET 
            client_name = ?, client_title = ?, content = ?, rating = ?, image_url = ?, 
            company = ?, author = ?, role = ?, avatar = ? 
            WHERE id = ?`,
            [finalName, finalTitle, content || '', Number(rating) || 5, finalImage, company || '', finalName, finalTitle, finalImage, id]
        );

        return NextResponse.json({ success: true, message: 'Testimonial updated' });
    } catch (error: any) {
        console.error('Testimonials PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'Testimonial ID is required' }, { status: 400 });

        await pool.execute('DELETE FROM testimonials WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Testimonial deleted' });
    } catch (error: any) {
        console.error('Testimonials DELETE error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
