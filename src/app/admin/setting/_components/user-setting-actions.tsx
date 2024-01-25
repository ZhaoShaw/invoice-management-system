import Icon from "~/components/icon";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuContent,
} from "~/components/ui/dropdown-menu";
import { UserCreateEdit } from "./user-create-edit";
import { type Table, type Row } from "@tanstack/react-table";
import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";
import { UserStatus } from "~/types/index.d";
import { useRef } from "react";

interface UserSettingActionsProps<TData> {
  row: Row<TData>;
  refetchData: () => Promise<void>;
}

export default function UserSettingActions<TData>({
  row,
  refetchData,
}: UserSettingActionsProps<TData>) {
  const userRef = useRef(null);
  const userId: string = row.getValue("id");
  const userName: string = row.getValue("name");
  const userEmail: string = row.getValue("email");
  const userStatus: UserStatus = row.getValue("status");
  const { toast } = useToast();
  const setUserStatus = api.user.setUserStatus.useMutation({
    async onSuccess() {
      await refetchData();
      toast({
        description: "Success",
      });
    },
    onError() {
      toast({
        description: "Something wrong, contact manager",
      });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="icon" className="h-6 w-6" asChild>
          <Icon name="more-horizontal" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <UserCreateEdit
              ref={userRef}
              children={
                <Button variant="ghost" type="button">
                  Edit
                </Button>
              }
              userId={userId}
              userName={userName}
              userEmail={userEmail}
              refetchData={refetchData}
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            {userStatus === UserStatus.ALLOW ? (
              <Button
                variant="ghost"
                type="button"
                onClick={() =>
                  setUserStatus.mutate({
                    id: userId,
                    status: UserStatus.FORBIDDEN,
                  })
                }
              >
                Forbid
              </Button>
            ) : (
              <Button
                variant="ghost"
                type="button"
                onClick={() =>
                  setUserStatus.mutate({ id: userId, status: UserStatus.ALLOW })
                }
              >
                Allow
              </Button>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
