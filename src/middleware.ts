import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (authHeader?.startsWith('Basic ')) {
    const base64 = authHeader.slice(6)
    const decoded = Buffer.from(base64, 'base64').toString('utf-8')
    const [user, ...rest] = decoded.split(':')
    const password = rest.join(':') // コロンを含むパスワードに対応

    const validUser = process.env.BASIC_AUTH_USER ?? 'admin'
    const validPassword = process.env.BASIC_AUTH_PASSWORD ?? 'ecagent2026'

    if (user === validUser && password === validPassword) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="EC Agent"',
    },
  })
}

export const config = {
  // 静的ファイル・Next.js内部パスは除外
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
