"use client";
import { Switch } from "~/components/ui/switch";
import { api } from "~/trpc/react";
import { UserRole } from "~/types/index.d";
import { useToast } from "~/components/ui/use-toast";

const UserRoleSwitch = () => {
  const { toast } = useToast();
  const setRole = api.user.setRole.useMutation({
    onSuccess: () => {
      toast({ description: "success" });
    },
    onError: (error) => {
      toast({ description: "error" });
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCheckedChange = async (event: boolean) => {
    if (event) {
      setRole.mutate({ role: UserRole.ADMIN });
    } else {
      setRole.mutate({ role: UserRole.USER });
    }
  };
  return (
    <Switch
      className="fixed bottom-0 right-0 z-40"
      onCheckedChange={handleCheckedChange}
    ></Switch>
  );
};
export { UserRoleSwitch };
