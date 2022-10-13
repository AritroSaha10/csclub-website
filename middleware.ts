import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Extract short key from URL
  const shortened = request.nextUrl.pathname.replace("/short/", "").replace(/\//g, "");

  // Find base URL to use in our fetch request
  const baseUrl = request.url.slice(0, request.url.indexOf("/short/"));

  // Send API request to get Firestore data for us (middleware can't)
  const apiRes = await fetch(`${baseUrl}/api/shorten`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      short: shortened
    })
  });

  if (!apiRes.ok) {
    // Doesn't exist, 404
    return NextResponse.redirect(new URL('/404', request.url));
  }

  // Convert to JSON data
  const apiData = await apiRes.json()

  if (apiData.success) {
    // Redirect to URL if it exists
    return NextResponse.redirect(new URL(apiData.url));
  } else {
    // Doesn't exist, 404
    return NextResponse.redirect(new URL('/404', request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/short/:path*',
}