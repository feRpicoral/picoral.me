import { NextRequest, NextResponse } from 'next/server';

// routes that won't be rewritten
// while we don't have the same functionality as next.config.js' "afterFiles"
// to only run this after static files have been served, this is the best
// workaround to avoid blocking static files as well
const allowedRoutes = ['/timeline-point.svg'];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    if (pathname !== '/' && !allowedRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}
