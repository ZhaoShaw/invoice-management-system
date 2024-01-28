"use client";
import BasicBreadcrumbs from "~/app/_components/breadcrumbs";
import CreateEdit from "~/app/_components/create-edit";
import { api } from "~/trpc/react";

export default function QueryPage({ params }: { params: { id: string } }) {
  const links = [
    ["Home", "/admin/dashboard"],
    ["Detail", ""],
  ];
  const status = api.invoice.getCommitStatusByCommitId.useQuery(params.id);
  if (status.data === null) {
    return;
  }
  let isExpired = false;
  if (status.isSuccess) {
    isExpired = status.data.isExpired;

    return (
      <div>
        <BasicBreadcrumbs links={links} />
        <CreateEdit
          commitId={params.id}
          isLockMode={true}
          isInAdmin={true}
          isExpired={isExpired}
        />
      </div>
    );
  }
}
