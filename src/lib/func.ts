import { eachMonthOfInterval, format, formatISO, setDate } from "date-fns";
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

export const generateDateArray = (
  startDate: Date,
  endDate: Date,
  period: number,
) => {
  const res = eachMonthOfInterval(
    {
      start: startDate,
      end: endDate,
    },
    { step: period },
  ).map((d) => formatISO(setDate(d, startDate.getDate())));
  const newArr = [];
  for (let i = 0; i < res.length - 1; i++) {
    newArr.push({ startAt: res[i]!, endAt: res[i + 1]! });
  }
  return newArr;
};
