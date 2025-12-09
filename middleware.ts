import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('accessToken')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
      const payload = verifyAccessToken(token)
      if (!payload || payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/forbidden', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
