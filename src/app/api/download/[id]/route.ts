import { NextResponse, type NextRequest } from "next/server";
import { DownloadContext } from "../_lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (req.cookies.get("next-auth.session-token") === undefined) {
    throw new Error("Something Wrong");
  }
  const type = req.nextUrl.searchParams.get("type");
  if (!type) {
    throw new Error("Something Wrong");
  }
  const context = new DownloadContext(type);
  const result = await context.doGenerateZip(params.id);
  const zipAsBase64 = await result.generateAsync({ type: "base64" });
  return new NextResponse(zipAsBase64);
}
