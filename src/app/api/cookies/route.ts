import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  cookies().delete("next-auth.session-token");
  cookies().delete("next-auth.callback-url");
  cookies().delete("next-auth.csrf-token");
  return new NextResponse();
}
