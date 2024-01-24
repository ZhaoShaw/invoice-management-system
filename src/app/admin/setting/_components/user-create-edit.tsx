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
import { useState } from "react";

export function UserCreateEdit({
  children,
  userId = undefined,
}: {
  children: React.ReactNode;
  userId?: string | undefined;
}) {
  const isAddMode = !userId;
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const form = useForm<NewUser>({
    resolver: zodResolver(newUserSchema),
  });

  const commonMutationProcess = {
    onSuccess() {
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
    createUser.mutate(values);
    if (isAddMode) {
      createUser.mutate(values);
    } else {
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
                      <Input placeholder="" {...field} />
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
                      <Input placeholder="" {...field} />
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
}
