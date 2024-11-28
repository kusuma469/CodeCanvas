import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})

export const config = {
  matcher: [

    // '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // '/(api|trpc)(.*)',
  
    // Match all routes except static files
    '/((?!_next/static|favicon.ico|_next/image|.*\\.(css|js|png|jpg|jpeg|svg|ico|webp|ttf|woff2)).*)',
    '/(api|trpc)(.*)',
    // '/api/(.*)', // Always run for API routes
  ],
};