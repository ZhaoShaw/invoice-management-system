import { NextResponse, type NextRequest } from "next/server";
import { DownloadContext } from "../_lib/utils";
import { api } from "~/trpc/server";
import { parse } from "date-fns";
import JSZip from "jszip";

export async function GET(req: NextRequest) {
  if (req.cookies.get("next-auth.session-token") === undefined) {
    throw new Error("Something Wrong");
  }
  const type = req.nextUrl.searchParams.get("type");
  if (!type) {
    throw new Error("Something Wrong");
  }
  const userNameStr = req.nextUrl.searchParams.get("userName");
  const startDateStr = req.nextUrl.searchParams.get("startDate");
  const endDateStr = req.nextUrl.searchParams.get("endDate");

  let userName, startDate, endDate;

  if (userNameStr) {
    userName = userNameStr;
  }

  if (startDateStr) {
    startDate = parse(startDateStr, "yyyy/MM/dd", new Date());
  }

  if (endDateStr) {
    endDate = parse(endDateStr, "yyyy/MM/dd", new Date());
  }
  // TODO: solve hard code
  const invoices = api.invoice.getInvoiceCommitList.query({
    pageIndex: 0,
    pageSize: 200,
    userName: userName,
    startDate: startDate,
    endDate: endDate,
  });
  const zip = new JSZip();
  for (const i of (await invoices).rows) {
    const context = new DownloadContext("commit");
    const result = await context.doGenerateZip(i.id);
    const zipAsBase64 = await result.generateAsync({ type: "base64" });
    zip.file(`${i.updatedBy}-${i.id}.zip`, zipAsBase64, { base64: true });
  }

  const zipAsBase = await zip.generateAsync({ type: "base64" });
  return new NextResponse(zipAsBase);
}
