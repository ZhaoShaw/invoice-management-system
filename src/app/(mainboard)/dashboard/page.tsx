"use client";

import { userColumns } from "~/app/_components/columns";
import { InvoiceTable } from "~/app/_components/invoice-table";
import { api } from "~/trpc/react";

export default function Dashboard() {
  const invoiceList = api.invoice.getInvoiceCommitListByUser.useQuery();
  if (invoiceList.data === undefined) {
    return;
  }
  return (
    <InvoiceTable
      data={invoiceList.data}
      columns={userColumns}
      refetch={invoiceList.refetch}
    />
  );
}
