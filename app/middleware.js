import { NextResponse } from 'next/server';
import { decrypt } from '@/app/lib/session';
import { cookies } from 'next/headers';

const protectedRoutes = ['/edit', '/profile'];
const publicRoutes = ['/routes', '/signup', '/'];

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isProctedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);

  if (isProctedRoute && session?.admin) {
    return NextResponse.redirect(new URL('/', req.rextUrl));
  }

  if (
    isPublicRoute &&
    !session?.admin &&
    !req.nextUrl.pathname.startsWith('/edit')
  ) {
    return NextResponse.redirect(new URL('/edit', req.nextUrl));
  }

  return NextResponse.next();
}
