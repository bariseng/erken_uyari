import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/giris",
  },
});

export const config = {
  matcher: [
    "/projeler/:path*",
    "/rapor/:path*",
    "/api/projects/:path*",
  ],
};
