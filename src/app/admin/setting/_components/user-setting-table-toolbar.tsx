import { Button } from "~/components/ui/button";
import { UserCreateEdit } from "./user-create-edit";
import { type Table } from "@tanstack/react-table";

interface UserSettingTableToolbarProps<TData> {
  table: Table<TData>;
}

export function UserSettingTableToolbar<TData>({
  table,
}: UserSettingTableToolbarProps<TData>) {
  return (
    <div>
      <UserCreateEdit
        children={<Button variant="outline">Create User</Button>}
        refetchData={table.options.meta.refetchData}
      ></UserCreateEdit>
    </div>
  );
}
