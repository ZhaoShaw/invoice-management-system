import { type ColumnDef } from "@tanstack/react-table";
import { TablePagination } from "./table-pagination";

import { TableToolbar } from "./table-toolbar";

import { TableList } from "./table-list";
import { type Table as ReactTable } from "@tanstack/react-table";

interface InvoiceTableProps<TData, TValue> {
  table: ReactTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  isAdmin?: boolean;
}
const InvoiceTable = <TData, TValue>({
  columns,
  table,
  isAdmin = false,
}: InvoiceTableProps<TData, TValue>) => {
  return (
    <div>
      <TableToolbar table={table} isAdmin={isAdmin} />
      <TableList table={table} columns={columns} />
      <TablePagination table={table} />
    </div>
  );
};

export { InvoiceTable };
