import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (session !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  if (request.nextUrl.pathname.startsWith('/app')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (request.nextUrl.pathname === '/') {
    if (session === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    if (session === 'student') {
      return NextResponse.redirect(new URL('/app/home', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*', '/app/:path*'],
}
