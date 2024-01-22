"use client";

import { adminColumns } from "~/app/_components/columns";
import { InvoiceTable } from "~/app/_components/invoice-table";
import { api } from "~/trpc/react";

export default function AdminDashboard() {
  const invoiceList = api.invoice.getInvoiceCommitList.useQuery();
  if (invoiceList.data === undefined) {
    return;
  }
  return (
    <InvoiceTable
      data={invoiceList.data}
      columns={adminColumns}
      refetch={invoiceList.refetch}
    />
  );
}
