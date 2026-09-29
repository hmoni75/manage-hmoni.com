import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'nobodhara_aryan_society_super_secret_key_2026_x99!'
);

export interface UserPayload {
    id: number;
    email: string;
    name: string;
    role?: string;
}

// Sign JWT Token
export async function signToken(payload: UserPayload): Promise<string> {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // 7 days valid
        .sign(JWT_SECRET);
}

// Verify JWT Token
export async function verifyToken(token: string): Promise<UserPayload | null> {
    try {
        const verified = await jwtVerify(token, JWT_SECRET);
        return verified.payload as unknown as UserPayload;
    } catch {
        return null;
    }
}

