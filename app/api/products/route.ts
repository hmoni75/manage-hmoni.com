import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
    try {
        await initDB();
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM products ORDER BY id DESC');

        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await initDB();
        const { name, category, price, image, inventory_status, rating } = await request.json();

        if (!name || price === undefined) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
        }

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO products (name, category, price, image, inventory_status, rating) VALUES (?, ?, ?, ?, ?, ?)',
            [
                name,
                category || 'General',
                price,
                image || 'product-placeholder.png',
                inventory_status || 'INSTOCK',
                rating || 5
            ]
        );

        return NextResponse.json({
            success: true,
            product: { id: result.insertId, name, category, price, image, inventory_status, rating }
        });
    } catch (error) {
        console.error('Error adding product:', error);
        return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
    }
}

