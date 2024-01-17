import { format } from "date-fns";
import fs from "fs";
import { without } from "lodash";

export function getTodayUploadFiles(
  userId: string,
  assignedFiles: string[] | null = null,
): string[] {
  const date = format(new Date(Date.now()), "yyyy-MM-dd");
  const userInvoiceDir = `public/upload/${userId}/${date}`;
  try {
    const files = fs.readdirSync(userInvoiceDir);
    const fileNames = files.filter(
      (f) =>
        f.toLowerCase().endsWith(".png") ||
        f.toLowerCase().endsWith(".jpg") ||
        f.toLowerCase().endsWith(".jpeg"),
    );
    if (!assignedFiles || assignedFiles?.length === 0) {
      return fileNames.map((f) => `/upload/${userId}/${date}/${f}`);
    } else {
      return without(
        fileNames.map((f) => `/upload/${userId}/${date}/${f}`),
        ...assignedFiles,
      );
    }
  } catch (error) {
    return [];
  }
}
