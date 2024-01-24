import { Button } from "~/components/ui/button";
import { UserCreateEdit } from "./user-create-edit";

export function UserSettingTableToolbar() {
  return (
    <div>
      <UserCreateEdit
        children={<Button variant="outline">Create User</Button>}
      ></UserCreateEdit>
    </div>
  );
}
