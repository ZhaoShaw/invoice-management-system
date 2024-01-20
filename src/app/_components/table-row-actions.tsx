import { type Row, type Table } from "@tanstack/react-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import Icon from "~/components/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import b64ToBlob from "b64-to-blob";
import { saveAs } from "file-saver";
import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";
import { useState } from "react";

interface TableRowActionsProps<TData> {
  table: Table<TData>;
  row: Row<TData>;
}
export function TableRowActions<TData>({
  table,
  row,
}: TableRowActionsProps<TData>) {
  const commitId: string = row.getValue("id");
  const meta = table.options.meta;
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [groupSelected, setGroupSelected] = useState<string>("");
  const deleteMutation = api.invoice.deleteInvoiceCommitById.useMutation({
    onSuccess: async () => {
      toast({ description: "success" });
      await meta?.refetchData();
      setOpen(false);
    },
    onError: () => {
      toast({ description: "error" });
      setOpen(false);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(groupSelected);
  };
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
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              router.push(`/invoices/edit/${commitId}`);
            }}
          >
            <Icon name="file-edit" />
          </Button>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setGroupSelected(commitId);
              }}
            >
              <Icon name="x-circle" />
            </Button>
          </DialogTrigger>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Icon name="folder-input" />
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
        </div>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center">
            <DialogTitle>Delete ?</DialogTitle>
          </DialogHeader>
          <DialogFooter className="justify-center sm:justify-center sm:space-x-10">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
