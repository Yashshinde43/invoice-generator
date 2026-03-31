import { NextResponse, type NextRequest } from 'next/server'

const SESSION_COOKIE = 'firebase-uid'
const AUTH_PATHS = ['/login', '/signup']
const PROTECTED_PREFIX = '/dashboard'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const uid = request.cookies.get(SESSION_COOKIE)?.value

  // Protect dashboard routes — redirect to login if no session
  if (pathname.startsWith(PROTECTED_PREFIX) && !uid) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect already-authenticated users away from login/signup
  if (AUTH_PATHS.includes(pathname) && uid) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Pass x-pathname header so layouts can read the current path
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
