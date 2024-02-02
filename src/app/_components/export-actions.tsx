import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import b64ToBlob from "b64-to-blob";
import { saveAs } from "file-saver";
import { Button } from "~/components/ui/button";
import { FolderInput } from "lucide-react";
export function ExportActions({ commitId }: { commitId: string }) {
  const fetchZipFiles = async (
    commitId: string,
    typeName: string,
    fileName: string,
  ) => {
    const res = await fetch(
      `/api/download/${commitId}?` +
        new URLSearchParams({
          type: typeName,
        }).toString(),
      {
        method: "get",
      },
    );
    const zipAsBase64 = await res.text();
    const blob = b64ToBlob(zipAsBase64, "application/zip");
    saveAs(blob, fileName);
  };
  const exportCommit = async (commitId: string) => {
    await fetchZipFiles(commitId, "commit", "commit.zip");
  };

  const exportInvoices = async (commitId: string) => {
    await fetchZipFiles(commitId, "invoices", "invoices.zip");
  };
  const exportSheet = async (commitId: string) => {
    await fetchZipFiles(commitId, "sheet", "sheet.zip");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <FolderInput />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Button variant="link" onClick={() => exportCommit(commitId)}>
            Export Commit
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button variant="link" onClick={() => exportInvoices(commitId)}>
            Export Invoices
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button variant="link" onClick={() => exportSheet(commitId)}>
            Export Sheet
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
