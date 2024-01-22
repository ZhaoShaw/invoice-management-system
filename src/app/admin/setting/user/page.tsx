"use client";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { api } from "~/trpc/react";
import { columns } from "../_components/columns";
import { TableList } from "~/app/_components/table-list";
import { TablePagination } from "~/app/_components/table-pagination";
import { UserSettingTableToolbar } from "../_components/user-setting-table-toolbar";

export default function UserSettingPage() {
  const users = api.user.getAllUsers.useQuery();

  const table = useReactTable({
    data: users.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });
  return (
    <div>
      <UserSettingTableToolbar />
      <TableList table={table} columns={columns} />
      <TablePagination table={table} />
    </div>
  );
}
