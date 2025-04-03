import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req) {
  const token = await getToken({ req, secret }); // Extract user's token
  //console.log("Middleware Token:", token);

  const restrictedPaths = [
    "/customers",
    "/fields",
    "/customers2",
    "/fields2",
    "/customers3",
    "/fields3",
  ];
  const requestedPath = req.nextUrl.pathname;

  if (restrictedPaths.some((path) => requestedPath.startsWith(path))) {
    if (!token) {
      console.log("No token found. Redirecting to sign-in.");
      return NextResponse.redirect(new URL("/", req.url)); // Redirect unauthenticated users
    }

    // Call the API route to check authorization
    const response = await fetch(new URL("/api/auth/authorize", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: token.email }), // Send user's email to the API
    });

    if (response.status !== 200) {
      console.log("Unauthorized user. Redirecting to sign-in.");
      return NextResponse.redirect(new URL("/", req.url)); // Redirect unauthorized users
    }
  }

  console.log("Token valid. Access granted.");
  return NextResponse.next(); // Allow access to the requested resource
}

export const config = {
  matcher: [
    "/customers/:path*",
    "/fields/:path*",
    "/customers2/:path*",
    "/fields2/:path*",
    "/customers3/:path*",
    "/fields3/:path*",
  ], // Define routes for middleware
};
