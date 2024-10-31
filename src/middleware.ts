import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Create matchers for protected and auth routes
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  
  const { userId } = await auth();
  if (isAuthRoute(req) && userId) {
    const url = new URL('/dashboard', req.url);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};