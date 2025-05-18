'use server';

import { headers } from 'next/headers';

export async function getClientIp() {
  const headersList = await headers();

  const ip =
    headersList.get('cf-connecting-ip') || // Cloudflare IP
    headersList.get('x-real-ip') || // Vercel or other reverse proxies
    (headersList.get('x-forwarded-for') || '127.0.0.1').split(',')[0]; // Standard header

  return ip;
}
