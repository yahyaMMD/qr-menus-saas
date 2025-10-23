import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  return session;
}

export function handleError(error: any) {
  console.error("API Error:", error);
  
  if (error.message === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  if (error.message === "Not found") {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }
  
  return NextResponse.json(
    { error: error.message || "Internal server error" },
    { status: 500 }
  );
}