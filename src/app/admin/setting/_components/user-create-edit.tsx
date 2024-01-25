"use client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";

import { type NewUser } from "~/types/index.d";

import { newUserSchema } from "~/lib/verification";
import { useState, forwardRef } from "react";
interface UserCreateEditProps {
  children: React.ReactNode;
  userId?: string | undefined;
  userName?: string | undefined;
  userEmail?: string | undefined;
  refetchData: () => Promise<void>;
}

export const UserCreateEdit = forwardRef(
  (
    {
      children,
      userId = undefined,
      userName = "",
      userEmail = "",
      refetchData,
    }: UserCreateEditProps,
    ref,
  ) => {
    const isAddMode = !userId;
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const form = useForm<NewUser>({
      resolver: zodResolver(newUserSchema),
      defaultValues: {
        name: userName,
        email: userEmail,
      },
    });

    const commonMutationProcess = {
      async onSuccess() {
        await refetchData();
        form.setValue("name", "");
        form.setValue("email", "");
        toast({
          description: "Success",
        });
        setOpen(false);
      },
      onError() {
        toast({
          description: "Something wrong, contact manager",
        });
        setOpen(false);
      },
    };
    const createUser = api.user.createUser.useMutation(commonMutationProcess);
    const editUser = api.user.updateUser.useMutation(commonMutationProcess);
    function onSubmit(values: NewUser) {
      if (isAddMode) {
        createUser.mutate(values);
      } else {
        values.id = userId;
        editUser.mutate(values);
      }
    }
    return (
      <div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>{children}</SheetTrigger>
          <SheetContent>
            <Form {...form}>
              <form
                className="flex flex-col justify-center"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Name</Label>
                      <FormControl>
                        <Input placeholder="" autoFocus={false} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Email</Label>
                      <FormControl>
                        <Input placeholder="" autoFocus={false} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button className="mt-3" type="submit">
                  OK
                </Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>
    );
  },
);
