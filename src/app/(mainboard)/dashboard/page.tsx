"use client";

import { userColumns } from "~/app/_components/columns";
import { TableList } from "~/app/_components/table-list";
import { api } from "~/trpc/react";

export default function Dashboard() {
  const invoiceList = api.invoice.getInvoiceCommitListByUser.useQuery();
  if (invoiceList.data === undefined) {
    return;
  }
  return (
    <TableList
      data={invoiceList.data}
      columns={userColumns}
      refetch={invoiceList.refetch}
    />
  );
}
