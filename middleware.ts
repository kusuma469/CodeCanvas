import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    // // Skip Next.js internals and all static files, unless found in search params
    // '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // // Always run for API routes
    // '/',
    // '/(api|trpc)(.*)',
    // Match everything except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|png|jpg|jpeg|svg|ico|webp|ttf|woff2)).*)',
    // Always include API and tRPC routes
    '/api/(.*)',
    '/trpc/(.*)', 

  ],
};