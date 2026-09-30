import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await initDB();
        const { searchParams } = new URL(req.url);
        const download = searchParams.get('download') === '1';

        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT filename, file_data FROM cv_resume WHERE is_active = 1 ORDER BY id DESC LIMIT 1'
        );

        if (rows.length === 0 || !rows[0].file_data) {
            return new NextResponse('CV file not found', { status: 404 });
        }

        const { filename, file_data } = rows[0];
        const base64Content = file_data.replace(/^data:application\/pdf;base64,/, '');
        const pdfBuffer = Buffer.from(base64Content, 'base64');

        const dispositionType = download ? 'attachment' : 'inline';
        const safeFilename = filename || 'H_Moni_CV.pdf';

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `${dispositionType}; filename="${safeFilename}"`,
                'Content-Length': pdfBuffer.length.toString(),
                'Cache-Control': 'public, max-age=3600, s-maxage=3600'
            }
        });
    } catch (error: any) {
        console.error('CV Download error:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
