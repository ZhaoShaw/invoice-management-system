"use client";
import Link from "next/link";
import { Button } from "~/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { api } from "~/trpc/react";
import Icon from "~/components/icon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "~/components/ui/use-toast";
import { columns } from "./_components/columns";

import { subDays, format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { TablePagination } from "./_components/table-pagination";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import b64ToBlob from "b64-to-blob";
import { saveAs } from "file-saver";

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [groupSelected, setGroupSelected] = useState<string>("");
  const invoiceList = api.invoice.getInvoiceCommitListByUser.useQuery();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(Date.now(), 30),
    to: new Date(Date.now()),
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data: invoiceList.data ?? [],
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

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

  if (invoiceList.data === undefined) {
    return;
  }
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="date" variant={"outline"}>
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd,y")} -{" "}
                      {format(date.to, "LLL dd,y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(e: DateRange | undefined) => {
                  setDate(e);
                  table.getColumn("createdAt")?.setFilterValue(e);
                }}
                numberOfMonths={2}
              ></Calendar>
            </PopoverContent>
          </Popover>

          <Button asChild>
            <Link href="/invoices/create">Create Commit</Link>
          </Button>
        </div>
        <div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          router.push(`/invoices/edit/${row.original.id}`);
                        }}
                      >
                        <Icon name="file-edit" />
                      </Button>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setGroupSelected(row.original.id);
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
                            <Button
                              variant="link"
                              onClick={() => exportCommit(row.original.id)}
                            >
                              Export Commit
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Button
                              variant="link"
                              onClick={() => exportInvoices(row.original.id)}
                            >
                              Export Invoices
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Button
                              variant="link"
                              onClick={() => exportSheet(row.original.id)}
                            >
                              Export Sheet
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>No Results</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination table={table}></TablePagination>
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
