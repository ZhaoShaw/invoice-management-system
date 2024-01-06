"use client";
import Link from "next/link";
import { Button } from "~/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

import { api } from "~/trpc/react";
import type { InvoiceCommit } from "@prisma/client/index.d";
import Icon from "~/components/icon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "~/components/ui/use-toast";

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [groupSelected, setGroupSelected] = useState<string>("");
  const invoiceList = api.invoice.getInvoiceCommitListByUser.useQuery();

  const deleteMutation = api.invoice.deleteInvoiceCommitById.useMutation({
    onSuccess: async () => {
      toast({ description: "success" });
      await invoiceList.refetch();
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
  if (invoiceList.data === undefined) {
    return;
  }
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <Button asChild>
          <Link href="/invoices/create">Create Commit</Link>
        </Button>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Total Groups</TableHead>
              <TableHead>Number of Invoices </TableHead>
              <TableHead>Commit Status</TableHead>
              <TableHead className="text-right">Created Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoiceList.data.map((commit: InvoiceCommit) => (
              <TableRow key={commit.id}>
                <TableCell className="font-medium">{commit.id}</TableCell>
                <TableCell>{commit.totalAmount.toString()}</TableCell>
                <TableCell>{commit.totalGroups}</TableCell>
                <TableCell>{commit.totalItems}</TableCell>
                <TableCell>{commit.commitStatus}</TableCell>
                <TableCell className="text-right">
                  {commit.createdAt.toLocaleDateString()}
                </TableCell>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      router.push(`/invoices/edit/${commit.id}`);
                    }}
                  >
                    <Icon name="file-edit" />
                  </Button>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setGroupSelected(commit.id);
                      }}
                    >
                      <Icon name="x-circle" />
                    </Button>
                  </DialogTrigger>
                </div>
              </TableRow>
            ))}
          </TableBody>
        </Table>

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
