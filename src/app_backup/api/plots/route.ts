import { NextResponse } from 'next/server';
import { getPlots, getDbPool, MOCK_PLOTS } from '@/lib/db';

export async function GET() {
  const result = await getPlots();
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plot_number, block, size_katha, price_bdt, facing, road_width_ft, status, description, image_url } = body;

    if (!plot_number || !block || !size_katha || !price_bdt) {
      return NextResponse.json({ success: false, message: 'Missing required plot fields' }, { status: 400 });
    }

    const pool = getDbPool();
    if (pool) {
      const [res]: any = await pool.query(
        'INSERT INTO plots (plot_number, block, size_katha, price_bdt, facing, road_width_ft, status, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          plot_number,
          block,
          size_katha,
          price_bdt,
          facing || 'North',
          road_width_ft || 30,
          status || 'available',
          description || '',
          image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
        ]
      );
      return NextResponse.json({ success: true, id: res.insertId, isConnectedToDb: true });
    }

    // Mock fallback insert
    const newPlot = {
      id: MOCK_PLOTS.length + 1,
      plot_number,
      block,
      size_katha: Number(size_katha),
      price_bdt: Number(price_bdt),
      facing: facing || 'North',
      road_width_ft: Number(road_width_ft) || 30,
      status: status || 'available',
      description: description || '',
      image_url: image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    };
    MOCK_PLOTS.unshift(newPlot);

    return NextResponse.json({ success: true, id: newPlot.id, isConnectedToDb: false, plot: newPlot });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
