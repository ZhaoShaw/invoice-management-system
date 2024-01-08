import { type ColumnDef } from "@tanstack/react-table";
import { type CommitStatus } from "~/types/index.d";
import type { InvoiceCommit } from "@prisma/client/index.d";
import { type DateRange } from "react-day-picker";

export const columns: ColumnDef<InvoiceCommit>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => <div>{row.getValue("totalAmount")}</div>,
  },
  {
    accessorKey: "totalGroups",
    header: "Total Groups",
    cell: ({ row }) => <div>{row.getValue("totalGroups")}</div>,
  },
  {
    accessorKey: "totalItems",
    header: "Number of Invoices",
    cell: ({ row }) => <div>{row.getValue("totalItems")}</div>,
  },
  {
    accessorKey: "commitStatus",
    header: "Commit Status",
    cell: ({ row }) => {
      const status: CommitStatus = row.getValue("commitStatus");
      return <div>{status}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }) => {
      const date: Date = row.getValue("createdAt");
      return <div>{date.toLocaleDateString()}</div>;
    },
    filterFn: (row, id, value: DateRange | undefined) => {
      if (value?.from === undefined || value.to === undefined) {
        return true;
      }
      const sd: Date = value.from;
      const ed: Date = value.to;
      const date: Date = row.getValue("createdAt");
      console.log(sd, ed, date);
      return date >= sd && date <= ed;
    },
  },
];
