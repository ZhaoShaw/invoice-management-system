import { NextResponse, type NextRequest } from "next/server";
import path from "path";
import { api } from "~/trpc/server";
import JSZip from "jszip";
import fs from "fs";
import ExcelJS from "exceljs";
import { Stream } from "stream";

async function getInvoices(commitId: string) {
  const invoiceSrcList =
    await api.invoice.getInvoiceSrcListByCommitId.query(commitId);
  const zip = new JSZip();
  invoiceSrcList.forEach((i) =>
    zip.file(i.substring(i.lastIndexOf("/")), fs.readFileSync("public" + i)),
  );
  return zip;
}

async function getSheet(commitId: string) {
  const invoiceGroups =
    await api.invoice.getInvoiceGroupsByCommitId.query(commitId);
  const stream = new Stream.PassThrough();
  const options = {
    stream: stream,
    useStyles: true,
  };
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter(options);
  const sheet = workbook.addWorksheet("CommitSheet");
  sheet.columns = [
    { header: "Total Amount", key: "totalAmount", width: 20 },
    { header: "Number of Invoices", key: "totalItems", width: 20 },
    { header: "Purpose", key: "purpose", width: 20 },
  ];
  invoiceGroups.forEach((i) => {
    sheet
      .addRow({
        totalAmount: Number(i.totalAmount),
        totalItems: i.totalItems,
        purpose: i.purpose,
      })
      .commit();
  });
  sheet.commit();
  await workbook.commit();
  const zip = new JSZip();
  zip.file("sheet.xlsx", stream);
  return zip;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (req.cookies.get("next-auth.session-token") === undefined) {
    throw new Error("Something Wrong");
  }
  const type = req.nextUrl.searchParams.get("type");
  if (type === "invoices") {
    const zip = await getInvoices(params.id);
    const zipAsBase64 = await zip.generateAsync({ type: "base64" });
    return new NextResponse(zipAsBase64);
  }
  if (type === "sheet") {
    const zip = await getSheet(params.id);
    const zipAsBase64 = await zip.generateAsync({ type: "base64" });
    return new NextResponse(zipAsBase64);
  }
  return NextResponse.json({ success: true });
}
