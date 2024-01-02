import fs from "fs";
import { type NextRequest, NextResponse } from "next/server";
import { api } from "~/trpc/server";
import { format } from "date-fns";
import { fromPath } from "pdf2pic";

const options = {
  density: 100,
  saveFilename: "untitled",
  savePath: "./images",
  format: "png",
  width: 600,
  height: 600,
};

export async function POST(req: NextRequest) {
  if (req.cookies.get("next-auth.session-token") === undefined) {
    throw new Error("Something Wrong");
  }
  const user = await api.user.getUserBySessionToken.query({
    sessionToken: req.cookies.get("next-auth.session-token")!.value,
  });
  const date = format(new Date(Date.now()), "yyyy-MM-dd");
  const userInvoiceDir = `public/upload/${user?.userId}/${date}`;
  if (!fs.existsSync(userInvoiceDir)) {
    fs.mkdirSync(userInvoiceDir, { recursive: true });
  }
  const formData = await req.formData();
  const formDataEntryValues = Array.from(formData.values());
  for (const formDataEntryValue of formDataEntryValues) {
    if (
      typeof formDataEntryValue === "object" &&
      "arrayBuffer" in formDataEntryValue
    ) {
      const file = formDataEntryValue;
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(`${userInvoiceDir}/${file.name}`, buffer);
      if (file.name.endsWith(".pdf")) {
        options.savePath = userInvoiceDir;
        options.saveFilename = file.name.substring(
          0,
          file.name.lastIndexOf("."),
        );
        const convert = fromPath(`${userInvoiceDir}/${file.name}`, options);
        await convert(1, { responseType: "image" });
      }
    }
  }
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  if (req.cookies.get("next-auth.session-token") === undefined) {
    throw new Error("Something Wrong");
  }
  const user = await api.user.getUserBySessionToken.query({
    sessionToken: req.cookies.get("next-auth.session-token")!.value,
  });
  const date = format(new Date(Date.now()), "yyyy-MM-dd");
  const userInvoiceDir = `public/upload/${user?.userId}/${date}`;
  const files = fs.readdirSync(userInvoiceDir);
  console.log(files[0]);
  const filesSrc = files
    .filter(
      (f) =>
        f.toLowerCase().endsWith(".png") ||
        f.toLowerCase().endsWith(".jpg") ||
        f.toLowerCase().endsWith(".jpeg"),
    )
    .map((f) => `/upload/${user?.userId}/${date}/${f}`);
  return NextResponse.json(filesSrc);
}
