"use client";

import { adminColumns } from "~/app/_components/columns";
import { TableList } from "~/app/_components/table-list";
import { api } from "~/trpc/react";

export default function AdminDashboard() {
  const invoiceList = api.invoice.getInvoiceCommitList.useQuery();
  if (invoiceList.data === undefined) {
    return;
  }
  return (
    <TableList
      data={invoiceList.data}
      columns={adminColumns}
      refetch={invoiceList.refetch}
    />
  );
}
