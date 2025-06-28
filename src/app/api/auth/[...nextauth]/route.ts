import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

// Exportar apenas GET e POST para compatibilidade
export const GET = handler;
export const POST = handler;
