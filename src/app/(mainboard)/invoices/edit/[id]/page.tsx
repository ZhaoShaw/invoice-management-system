import CreateEdit from "../../_components/create-edit";
export default function EditPage({ params }: { params: { id: string } }) {
  return <CreateEdit commitId={params.id}></CreateEdit>;
}
