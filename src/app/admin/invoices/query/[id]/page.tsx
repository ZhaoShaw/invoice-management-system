import CreateEdit from "~/app/_components/create-edit";

export default function QueryPage({ params }: { params: { id: string } }) {
  return <CreateEdit commitId={params.id} isLockMode={true} isInAdmin={true} />;
}
