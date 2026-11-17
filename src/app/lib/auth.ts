import { headers } from 'next/headers';
import { verifyToken, JwtPayload } from '@/core/infrastructure/auth/jwt';

export async function getAuthUser(): Promise<JwtPayload | null> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<JwtPayload> {
  const user = await getAuthUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireAdmin(): Promise<JwtPayload> {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}