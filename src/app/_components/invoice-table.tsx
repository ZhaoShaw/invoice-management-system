import { type ColumnDef } from "@tanstack/react-table";
import { TablePagination } from "./table-pagination";

import { TableToolbar } from "./table-toolbar";
import { useState } from "react";

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { type UseQueryResult } from "@tanstack/react-query";
import { TableList } from "./table-list";

interface InvoiceTableProps<TData, TValue> {
  refetch?: () => Promise<UseQueryResult>;
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
}

export function InvoiceTable<TData, TValue>({
  refetch,
  data,
  columns,
}: InvoiceTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    meta: {
      refetchData: async () => {
        if (refetch !== undefined) {
          await refetch();
        }
      },
    },
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

  return (
    <div>
      <TableToolbar table={table} />
      <TableList table={table} columns={columns} />
      <TablePagination table={table} />
    </div>
  );
}
