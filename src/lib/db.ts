import mysql from 'mysql2/promise';

// Define Data Types
export interface Plot {
  id: number;
  plot_number: string;
  block: string;
  size_katha: number;
  price_bdt: number;
  facing: string;
  road_width_ft: number;
  status: 'available' | 'booked' | 'sold';
  description: string;
  image_url: string;
  created_at?: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  category: string;
  is_urgent: boolean | number;
  published_at?: string;
}

export interface Inquiry {
  id?: number;
  applicant_name: string;
  phone: string;
  email?: string;
  plot_id?: number | null;
  message?: string;
  status?: 'pending' | 'contacted' | 'approved' | 'rejected';
  created_at?: string;
}

// Fallback Mock Data
export const MOCK_PLOTS: Plot[] = [
  {
    id: 1,
    plot_number: 'A-102',
    block: 'Block A',
    size_katha: 3.0,
    price_bdt: 4500000,
    facing: 'South-East',
    road_width_ft: 40,
    status: 'available',
    description: 'Prime corner plot near central park and mosque. Ready for handover.',
    image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
  },
  {
    id: 2,
    plot_number: 'A-105',
    block: 'Block A',
    size_katha: 5.0,
    price_bdt: 7500000,
    facing: 'North',
    road_width_ft: 35,
    status: 'available',
    description: 'Spacious 5 katha plot adjacent to 40ft wide avenue road.',
    image_url: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800',
  },
  {
    id: 3,
    plot_number: 'B-201',
    block: 'Block B',
    size_katha: 3.5,
    price_bdt: 5250000,
    facing: 'South',
    road_width_ft: 30,
    status: 'booked',
    description: 'Beautiful lakeside view plot in Block B residential area.',
    image_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800',
  },
  {
    id: 4,
    plot_number: 'B-204',
    block: 'Block B',
    size_katha: 4.0,
    price_bdt: 6000000,
    facing: 'East',
    road_width_ft: 30,
    status: 'available',
    description: 'Ideal for residential duplex building with full utility connection.',
    image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
  },
  {
    id: 5,
    plot_number: 'C-302',
    block: 'Block C',
    size_katha: 5.0,
    price_bdt: 7000000,
    facing: 'North-East',
    road_width_ft: 50,
    status: 'available',
    description: 'Main commercial avenue front plot in Block C.',
    image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
  },
  {
    id: 6,
    plot_number: 'C-310',
    block: 'Block C',
    size_katha: 10.0,
    price_bdt: 14000000,
    facing: 'South',
    road_width_ft: 60,
    status: 'sold',
    description: 'Large premium commercial / multi-story building block.',
    image_url: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800',
  },
];

export const MOCK_NOTICES: Notice[] = [
  {
    id: 1,
    title: 'Annual General Meeting (AGM) 2026',
    content: 'The Annual General Meeting of Nobodhara Aryan Society will take place at the Society Community Center on 25th September 2026 at 10:00 AM. All members are cordially requested to attend.',
    category: 'AGM',
    is_urgent: 1,
    published_at: '2026-09-01 10:00:00',
  },
  {
    id: 2,
    title: 'Road Widening & Electric Line Installation Update',
    content: 'Phase-2 road carpet paving and underground electrification work in Block A & B is currently underway. Completion expected by October 2026.',
    category: 'Development',
    is_urgent: 0,
    published_at: '2026-08-20 14:30:00',
  },
  {
    id: 3,
    title: 'Plot Registration & Mutation Support Camp',
    content: 'A dedicated mutation and plot registration support desk will be open at the main office every Saturday this month.',
    category: 'Notice',
    is_urgent: 0,
    published_at: '2026-08-10 09:00:00',
  },
];

export const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: 1,
    applicant_name: 'Tanvir Hossain',
    phone: '01711223344',
    email: 'tanvir@example.com',
    plot_id: 1,
    message: 'Interested in booking Block A Plot A-102. Please share payment terms.',
    status: 'pending',
    created_at: '2026-09-05 11:20:00',
  },
];

// Helper to check DB connection
let pool: mysql.Pool | null = null;

export function getDbPool(): mysql.Pool | null {
  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
    if (!pool) {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 5000,
      });
    }
    return pool;
  }
  return null;
}

// Fetch all plots
export async function getPlots(): Promise<{ plots: Plot[]; isConnectedToDb: boolean }> {
  const dbPool = getDbPool();
  if (dbPool) {
    try {
      const [rows] = await dbPool.query('SELECT * FROM plots ORDER BY id DESC');
      return { plots: rows as Plot[], isConnectedToDb: true };
    } catch (error) {
      console.warn('cPanel DB query error, using fallback data:', error);
    }
  }
  return { plots: MOCK_PLOTS, isConnectedToDb: false };
}

// Fetch notices
export async function getNotices(): Promise<{ notices: Notice[]; isConnectedToDb: boolean }> {
  const dbPool = getDbPool();
  if (dbPool) {
    try {
      const [rows] = await dbPool.query('SELECT * FROM notices ORDER BY id DESC');
      return { notices: rows as Notice[], isConnectedToDb: true };
    } catch (error) {
      console.warn('cPanel DB query error, using fallback data:', error);
    }
  }
  return { notices: MOCK_NOTICES, isConnectedToDb: false };
}

// Save inquiry
export async function createInquiry(data: Inquiry): Promise<{ success: boolean; id?: number; isConnectedToDb: boolean }> {
  const dbPool = getDbPool();
  if (dbPool) {
    try {
      const [result]: any = await dbPool.query(
        'INSERT INTO inquiries (applicant_name, phone, email, plot_id, message, status) VALUES (?, ?, ?, ?, ?, ?)',
        [
          data.applicant_name,
          data.phone,
          data.email || null,
          data.plot_id || null,
          data.message || null,
          'pending',
        ]
      );
      return { success: true, id: result.insertId, isConnectedToDb: true };
    } catch (error) {
      console.warn('cPanel DB insert error, using in-memory save fallback:', error);
    }
  }
  
  // Local fallback
  const newInquiry: Inquiry = {
    ...data,
    id: MOCK_INQUIRIES.length + 1,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  MOCK_INQUIRIES.push(newInquiry);
  return { success: true, id: newInquiry.id, isConnectedToDb: false };
}
