import { api } from "~/trpc/server";
import JSZip from "jszip";
import fs from "fs";
import ExcelJS from "exceljs";
import { Stream } from "stream";

export class DownloadContext {
  private zipTypeString: string;
  private zipType: ZipType;
  constructor(zipTypeString: string) {
    this.zipTypeString = zipTypeString;
    this.zipType = this.getZipType[zipTypeString] ?? new SheetZip();
  }

  private getZipType: Record<string, ZipType> = {
    invoices: new InvoicesZip(),
    sheet: new SheetZip(),
    commit: new CommitZip(),
  };

  public doGenerateZip = (commitId: string): Promise<JSZip> => {
    const zip = new JSZip();
    return this.zipType.getZipAsBase64(zip, commitId);
  };
}

interface ZipType {
  getZipAsBase64(zip: JSZip, commitId: string): Promise<JSZip>;
}

class InvoicesZip implements ZipType {
  async getZipAsBase64(zip: JSZip, commitId: string): Promise<JSZip> {
    const invoiceSrcList =
      await api.invoice.getInvoiceSrcListByCommitId.query(commitId);
    invoiceSrcList.forEach((i) =>
      zip.file(i.substring(i.lastIndexOf("/")), fs.readFileSync("public" + i)),
    );
    return zip;
  }
}
class SheetZip implements ZipType {
  async getZipAsBase64(zip: JSZip, commitId: string): Promise<JSZip> {
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
    zip.file("sheet.xlsx", stream);
    return zip;
  }
}

class CommitZip implements ZipType {
  async getZipAsBase64(zip: JSZip, commitId: string): Promise<JSZip> {
    const invoices = await new InvoicesZip().getZipAsBase64(zip, commitId);
    const sheet = await new SheetZip().getZipAsBase64(invoices, commitId);
    return sheet;
  }
}
