import { withAuth } from "next-auth/middleware"

// This middleware protects routes by redirecting unauthenticated users to the login page.
export default withAuth({
  pages: {
    signIn: '/login',
  },
})

// This config specifies which routes should be protected.
export const config = {
  matcher: [
    '/dashboard/:path*', // Protège toutes les routes du tableau de bord
  ],
}