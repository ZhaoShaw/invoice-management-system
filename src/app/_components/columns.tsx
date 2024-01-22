import { type ColumnDef } from "@tanstack/react-table";
import { type CommitStatus } from "~/types/index.d";
import type { InvoiceCommit } from "@prisma/client/index.d";
import { type DateRange } from "react-day-picker";
import { UserTableRowActions } from "./user-table-row-actions";
import { AdminTableRowActions } from "./admin-table-row-actions";

interface InvoiceCommitTable extends InvoiceCommit {
  updatedBy?: string;
}

export const columns: ColumnDef<InvoiceCommitTable>[] = [
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
    accessorKey: "updatedAt",
    header: "Update Date",
    cell: ({ row }) => {
      const date: Date = row.getValue("updatedAt");
      return <div>{date.toLocaleDateString()}</div>;
    },
    filterFn: (row, id, value: DateRange | undefined) => {
      if (value?.from === undefined || value.to === undefined) {
        return true;
      }
      const sd: Date = value.from;
      const ed: Date = value.to;
      const date: Date = row.getValue("updatedAt");
      return date >= sd && date <= ed;
    },
  },
];

export const userColumns = columns.concat({
  id: "actions",
  cell: ({ table, row }) => {
    return <UserTableRowActions table={table} row={row} />;
  },
});

export const adminColumns = columns.concat([
  {
    accessorKey: "updatedBy",
    header: "User",
    cell: ({ row }) => <div>{row.getValue("updatedBy")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <AdminTableRowActions row={row} />;
    },
  },
]);
