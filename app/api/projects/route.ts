import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM projects ORDER BY is_highlighted DESC, sort_order ASC, id DESC'
        );
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('Projects GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            title,
            description,
            image_url,
            project_url,
            github_url,
            tech_used,
            category,
            is_highlighted,
            sort_order,
            location,
            size,
            service
        } = body;

        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO projects 
            (title, description, image_url, project_url, github_url, tech_used, category, is_highlighted, sort_order, location, size, service) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                description || '',
                image_url || '',
                project_url || '',
                github_url || '',
                tech_used || '',
                category || 'General',
                is_highlighted ? 1 : 0,
                Number(sort_order) || 0,
                location || '',
                size || '',
                service || ''
            ]
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'Project created' });
    } catch (error: any) {
        console.error('Projects POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const {
            id,
            title,
            description,
            image_url,
            project_url,
            github_url,
            tech_used,
            category,
            is_highlighted,
            sort_order,
            location,
            size,
            service
        } = body;

        if (!id) return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });

        await pool.execute(
            `UPDATE projects SET 
            title = ?, description = ?, image_url = ?, project_url = ?, github_url = ?, 
            tech_used = ?, category = ?, is_highlighted = ?, sort_order = ?, location = ?, size = ?, service = ? 
            WHERE id = ?`,
            [
                title,
                description || '',
                image_url || '',
                project_url || '',
                github_url || '',
                tech_used || '',
                category || 'General',
                is_highlighted ? 1 : 0,
                Number(sort_order) || 0,
                location || '',
                size || '',
                service || '',
                id
            ]
        );

        return NextResponse.json({ success: true, message: 'Project updated' });
    } catch (error: any) {
        console.error('Projects PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });

        await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Project deleted' });
    } catch (error: any) {
        console.error('Projects DELETE error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
