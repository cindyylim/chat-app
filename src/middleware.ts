import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

/* eslint-disable */
export default function middleware(req: any) {
  return withAuth(req);
}

export const config = {
  matcher: ["/api/auth/callback", "/auth/callback"],
};
