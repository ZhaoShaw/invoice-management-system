import fs from "fs";
import { type NextRequest, NextResponse } from "next/server";
import { api } from "~/trpc/server";
import { format } from "date-fns";
import { fromPath } from "pdf2pic";
import { v4 as uuidv4 } from "uuid";
import { getTodayUploadFiles } from "~/lib/func";

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
    const randomId = uuidv4();
    if (
      typeof formDataEntryValue === "object" &&
      "arrayBuffer" in formDataEntryValue
    ) {
      const file = formDataEntryValue;
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExt = file.name.substring(file.name.lastIndexOf("."));
      fs.writeFileSync(`${userInvoiceDir}/${randomId}${fileExt}`, buffer);
      if (file.name.endsWith(".pdf")) {
        options.savePath = userInvoiceDir;
        options.saveFilename = randomId;
        const convert = fromPath(
          `${userInvoiceDir}/${randomId}${fileExt}`,
          options,
        );
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
  const userId = user?.id;
  if (userId === undefined) {
    return NextResponse.error();
  } else {
    const unassigned = getTodayUploadFiles(userId);
    const filesSrc = unassigned.map((f) => ({
      id: null,
      dragId: f.substring(f.lastIndexOf("/") + 1, f.indexOf(".")),
      src: f,
    }));
    return NextResponse.json(filesSrc);
  }
}
