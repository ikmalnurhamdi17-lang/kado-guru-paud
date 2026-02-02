import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// PENTING: Fungsi harus di-export dengan nama 'middleware' agar dikenali Next.js
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.delete({ name, ...options })
        },
      },
    }
  )

  // Mengecek apakah ada user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname === '/login'

  // Logika Keamanan
  if (!user && !isLoginPage) {
    // Jika tidak ada user dan bukan di halaman login, tendang ke /login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isLoginPage) {
    // Jika sudah ada user tapi coba akses login, balikkan ke /dashboard
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

// Konfigurasi agar middleware tidak memeriksa file gambar, css, atau icon
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}