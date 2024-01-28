import BasicBreadcrumbs from "~/app/_components/breadcrumbs";
import CreateEdit from "~/app/_components/create-edit";

export default function Create() {
  const links = [
    ["Home", "/dashboard"],
    ["Create", ""],
  ];
  return (
    <div>
      <BasicBreadcrumbs links={links} />
      <CreateEdit />
    </div>
  );
}
