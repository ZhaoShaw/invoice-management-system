// TODO: make it private access
import { api } from "~/trpc/server";
import { NextResponse } from "next/server";

export async function GET() {
  await api.invoice.setCommitExpired.mutate();
  return new NextResponse();
}
