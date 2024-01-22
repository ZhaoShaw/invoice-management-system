"use client";
import { CommitStatus } from "@prisma/client";
import CreateEdit from "~/app/_components/create-edit";
import { api } from "~/trpc/react";

export default function EditPage({ params }: { params: { id: string } }) {
  const status = api.invoice.getCommitStatusByCommitId.useQuery(params.id);
  if (status.data === null) {
    return;
  }
  let isLockMode = false;
  if (status.isSuccess) {
    isLockMode = status.data.commitStatus !== CommitStatus.NOTREVIEWED;
    return <CreateEdit commitId={params.id} isLockMode={isLockMode} />;
  }
}
