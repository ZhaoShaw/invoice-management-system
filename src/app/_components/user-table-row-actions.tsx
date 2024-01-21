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

import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";
import { useState } from "react";
import { ExportActions } from "./export-actions";

interface TableRowActionsProps<TData> {
  table: Table<TData>;
  row: Row<TData>;
}
export function UserTableRowActions<TData>({
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
          <ExportActions commitId={commitId} />
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
