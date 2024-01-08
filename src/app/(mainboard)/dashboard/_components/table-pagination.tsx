import { type Table } from "@tanstack/react-table";
import Icon from "~/components/icon";
import { Button } from "~/components/ui/button";

interface TablePaginationProps<TData> {
  table: Table<TData>;
}

export function TablePagination<TData>({ table }: TablePaginationProps<TData>) {
  return (
    <div>
      <div>
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </div>
      <div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <Icon name="chevrons-left"></Icon>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <Icon name="chevron-left"></Icon>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <Icon name="chevron-right"></Icon>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <Icon name="chevrons-right"></Icon>
        </Button>
      </div>
    </div>
  );
}
