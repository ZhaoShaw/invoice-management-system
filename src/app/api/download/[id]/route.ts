import { NextResponse, type NextRequest } from "next/server";
import path from "path";
import { api } from "~/trpc/server";
import JSZip from "jszip";
import fs from "fs";

async function getInvoices(commitId: string) {
  const invoiceSrcList =
    await api.invoice.getInvoiceSrcListByCommitId.query(commitId);
  const zip = new JSZip();
  invoiceSrcList.forEach((i) =>
    zip.file(
      i,
      fs.readFileSync(
        path.resolve(__dirname, "../../../../../../public" + i),
        "base64",
      ),
    ),
  );
  // zip
  //   .generateNodeStream({ type: "nodebuffer", streamFiles: true })
  //   .pipe(fs.createWriteStream("invoices.zip"))
  //   .on("finish", function () {
  //     console.log("sample.zip written.");
  //   });
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
  return NextResponse.json({ success: true });
}
