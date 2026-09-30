import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await initDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM pricing_plans WHERE id = ? AND deleted_at IS NULL',
                [id]
            );
            if (rows.length === 0) return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
            return NextResponse.json({ success: true, data: rows[0] });
        }

        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM pricing_plans WHERE deleted_at IS NULL ORDER BY sort_order ASC, id ASC'
        );
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('Pricing GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const {
            name,
            title,
            plan_key,
            price,
            price_numeric,
            billing_period,
            description,
            badge,
            is_popular,
            button_text,
            button_link,
            features,
            features_json,
            sort_order,
            is_active
        } = body;

        const finalName = name || title || 'New Plan';
        const finalKey = plan_key || finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const finalPrice = price || '$0';

        // Parse features
        let featuresList: string[] = [];
        if (Array.isArray(features_json)) {
            featuresList = features_json;
        } else if (typeof features === 'string') {
            featuresList = features.split('\n').map((f: string) => f.trim()).filter(Boolean);
            if (featuresList.length <= 1 && features.includes(',')) {
                featuresList = features.split(',').map((f: string) => f.trim()).filter(Boolean);
            }
        }
        const finalFeaturesStr = featuresList.join('\n');
        const finalFeaturesJson = JSON.stringify(featuresList);

        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO pricing_plans 
            (name, title, plan_key, price, price_numeric, billing_period, description, badge, is_popular, button_text, button_link, features, features_json, sort_order, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                finalName,
                finalName,
                finalKey,
                finalPrice,
                Number(price_numeric) || 0,
                billing_period || '/monthly',
                description || '',
                badge || '',
                is_popular ? 1 : 0,
                button_text || 'Get Started ↗',
                button_link || '#contact',
                finalFeaturesStr,
                finalFeaturesJson,
                Number(sort_order) || 0,
                is_active ?? 1
            ]
        );

        return NextResponse.json({ success: true, id: result.insertId, message: 'Pricing plan created' });
    } catch (error: any) {
        console.error('Pricing POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const {
            id,
            name,
            title,
            plan_key,
            price,
            price_numeric,
            billing_period,
            description,
            badge,
            is_popular,
            button_text,
            button_link,
            features,
            features_json,
            sort_order,
            is_active
        } = body;

        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        const finalName = name || title || 'New Plan';
        const finalKey = plan_key || finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const finalPrice = price || '$0';

        // Parse features
        let featuresList: string[] = [];
        if (Array.isArray(features_json)) {
            featuresList = features_json;
        } else if (typeof features === 'string') {
            featuresList = features.split('\n').map((f: string) => f.trim()).filter(Boolean);
            if (featuresList.length <= 1 && features.includes(',')) {
                featuresList = features.split(',').map((f: string) => f.trim()).filter(Boolean);
            }
        }
        const finalFeaturesStr = featuresList.join('\n');
        const finalFeaturesJson = JSON.stringify(featuresList);

        await pool.execute(
            `UPDATE pricing_plans SET 
            name = ?, title = ?, plan_key = ?, price = ?, price_numeric = ?, 
            billing_period = ?, description = ?, badge = ?, is_popular = ?, 
            button_text = ?, button_link = ?, features = ?, features_json = ?, 
            sort_order = ?, is_active = ? 
            WHERE id = ?`,
            [
                finalName,
                finalName,
                finalKey,
                finalPrice,
                Number(price_numeric) || 0,
                billing_period || '/monthly',
                description || '',
                badge || '',
                is_popular ? 1 : 0,
                button_text || 'Get Started ↗',
                button_link || '#contact',
                finalFeaturesStr,
                finalFeaturesJson,
                Number(sort_order) || 0,
                is_active ?? 1,
                id
            ]
        );

        return NextResponse.json({ success: true, message: 'Pricing plan updated' });
    } catch (error: any) {
        console.error('Pricing PUT error:', error);
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
            'UPDATE pricing_plans SET is_deleted = 1, isDelete = 1, deleted_at = NOW() WHERE id = ?',
            [id]
        );
        return NextResponse.json({ success: true, message: 'Pricing plan deleted' });
    } catch (error: any) {
        console.error('Pricing DELETE error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
