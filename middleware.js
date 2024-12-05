import { NextResponse } from "next/server";
import { getAuth } from "firebase/auth";

export function middleware(req) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    // Jika pengguna belum login, redirect ke halaman login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Izinkan akses ke halaman jika pengguna sudah login
  return NextResponse.next();
}

export const config = {
  matcher: ["/settings"], // Middleware hanya aktif untuk halaman Settings
};
