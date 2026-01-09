import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/api/auth', '/cursos', '/wset', '/about', '/contact']
  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route || (route !== '/' && pathname.startsWith(`${route}/`))
  )

  // Get token from JWT
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieName = isProduction
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    cookieName,
  })

  // Redirect authenticated users away from login page
  if (pathname === '/login' && token) {
    const role = token.role as string
    const redirectMap: Record<string, string> = {
      superadmin: '/admin',
      educator: '/educator',
      student: '/student',
    }
    const redirectUrl = redirectMap[role] || '/'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  if (isPublicRoute || pathname === '/login') {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify user still exists and is active in database
  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { isActive: true, role: true },
  })

  // If user doesn't exist or is inactive, clear session and redirect to login
  if (!user || !user.isActive) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('authjs.session-token')
    response.cookies.delete('__Secure-authjs.session-token')
    return response
  }

  // Profile page - any authenticated user can access
  if (pathname.startsWith('/profile')) {
    return NextResponse.next()
  }

  // Admin routes - only superadmin can access
  if (pathname.startsWith('/admin')) {
    if (user.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Educator routes - educator and superadmin can access
  if (pathname.startsWith('/educator')) {
    if (user.role !== 'educator' && user.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Student routes - student and superadmin can access
  if (pathname.startsWith('/student')) {
    if (user.role !== 'student' && user.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
