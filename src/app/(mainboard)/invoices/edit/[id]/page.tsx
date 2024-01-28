"use client";
import { CommitStatus } from "@prisma/client";
import BasicBreadcrumbs from "~/app/_components/breadcrumbs";
import CreateEdit from "~/app/_components/create-edit";
import { api } from "~/trpc/react";

export default function EditPage({ params }: { params: { id: string } }) {
  const links = [
    ["Home", "/dashboard"],
    ["Edit", ""],
  ];
  const status = api.invoice.getCommitStatusByCommitId.useQuery(params.id);
  if (status.data === null) {
    return;
  }
  let isLockMode = false;
  if (status.isSuccess) {
    isLockMode =
      status.data.commitStatus !== CommitStatus.NOTREVIEWED ||
      status.data.isExpired;
    return (
      <div>
        <BasicBreadcrumbs links={links} />
        <CreateEdit commitId={params.id} isLockMode={isLockMode} />
      </div>
    );
  }
}
