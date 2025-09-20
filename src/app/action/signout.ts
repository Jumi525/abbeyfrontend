"use server";

import { signOut } from "@/lib/auth";

export async function logoutAction() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to call backend sign-out endpoint", error);
  }
  await signOut({ redirectTo: "/auth/login" });
}
