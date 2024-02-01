"use client";

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
  type PaginationState,
} from "@tanstack/react-table";
import { subDays } from "date-fns";
import { useState, useMemo } from "react";
import { adminColumns } from "~/app/_components/columns";
import { InvoiceTable } from "~/app/_components/invoice-table";
import { api } from "~/trpc/react";

export default function AdminDashboard() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "updatedAt",
      value: {
        from: subDays(Date.now(), 30),
        to: new Date(Date.now()),
      },
    },
    { id: "updatedBy", value: "" },
  ]);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );
  const invoiceList = api.invoice.getInvoiceCommitList.useQuery({
    pageIndex,
    pageSize,
    startDate: columnFilters[0].value.from,
    endDate: columnFilters[0].value.to,
    userName: columnFilters[1]?.value,
  });

  const table = useReactTable({
    data: invoiceList.data?.rows ?? [],
    columns: adminColumns,
    pageCount: invoiceList.data?.pageCount ?? -1,
    meta: {
      refetchData: async () => {
        await invoiceList.refetch();
      },
    },
    state: {
      pagination,
      columnFilters,
    },
    manualPagination: true,
    onPaginationChange: setPagination,
    manualFiltering: true,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return <InvoiceTable table={table} columns={adminColumns} isAdmin={true} />;
}
