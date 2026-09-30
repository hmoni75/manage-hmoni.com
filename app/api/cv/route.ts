import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await initDB();
        const { searchParams } = new URL(req.url);
        const includeData = searchParams.get('include_data') === '1';

        const fields = includeData
            ? 'id, filename, file_size, title, created_at, updated_at, file_data'
            : 'id, filename, file_size, title, created_at, updated_at';

        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT ${fields} FROM cv_resume ORDER BY id DESC LIMIT 1`
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: true, data: null });
        }

        return NextResponse.json({ success: true, data: rows[0] });
    } catch (error: any) {
        console.error('CV GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const { filename, file_data, file_size, title } = body;

        if (!file_data) {
            return NextResponse.json({ success: false, error: 'File data is required' }, { status: 400 });
        }

        // Validate PDF mime or base64 prefix
        if (!file_data.startsWith('data:application/pdf') && !file_data.startsWith('JVBERi0')) {
            return NextResponse.json({ success: false, error: 'Only PDF files are allowed' }, { status: 400 });
        }

        const finalFilename = filename || 'H_Moni_CV.pdf';
        const finalTitle = title || 'H Moni Curriculum Vitae';
        const finalSize = Number(file_size) || Math.round((file_data.length * 3) / 4);

        // Check if there is an existing record
        const [existing] = await pool.execute<RowDataPacket[]>('SELECT id FROM cv_resume LIMIT 1');

        let recordId: number;

        if (existing.length > 0) {
            recordId = existing[0].id;
            await pool.execute(
                `UPDATE cv_resume SET 
                filename = ?, file_data = ?, file_size = ?, title = ?, updated_at = NOW() 
                WHERE id = ?`,
                [finalFilename, file_data, finalSize, finalTitle, recordId]
            );
        } else {
            const [insertResult] = await pool.execute<ResultSetHeader>(
                `INSERT INTO cv_resume (filename, file_data, file_size, title) 
                VALUES (?, ?, ?, ?)`,
                [finalFilename, file_data, finalSize, finalTitle]
            );
            recordId = insertResult.insertId;
        }

        // Try syncing to local public directory if accessible
        try {
            const base64Content = file_data.replace(/^data:application\/pdf;base64,/, '');
            const buffer = Buffer.from(base64Content, 'base64');

            const localPublicPaths = [
                path.join(process.cwd(), 'public', 'assets', 'cv.pdf'),
                'd:\\hmoni.com\\public\\assets\\cv.pdf'
            ];

            for (const p of localPublicPaths) {
                try {
                    const dir = path.dirname(p);
                    if (fs.existsSync(dir)) {
                        fs.writeFileSync(p, buffer);
                    }
                } catch (fsErr) {
                    // Ignore local filesystem write error if running on serverless
                }
            }
        } catch (e) {
            // Non-critical, ignore
        }

        return NextResponse.json({
            success: true,
            message: 'CV uploaded and updated successfully',
            data: { id: recordId, filename: finalFilename, file_size: finalSize, title: finalTitle }
        });
    } catch (error: any) {
        console.error('CV POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        await initDB();
        await pool.execute('DELETE FROM cv_resume');
        return NextResponse.json({ success: true, message: 'CV deleted successfully' });
    } catch (error: any) {
        console.error('CV DELETE error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
