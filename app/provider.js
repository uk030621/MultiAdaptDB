"use client"; // Ensure it's a client component

import { SessionProvider } from "next-auth/react";

export default function Provider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
