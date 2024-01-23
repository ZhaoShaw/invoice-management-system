"use client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";
import { useRouter } from "next/navigation";

const userNameSchema = z.object({
  username: z.string().min(1),
});

type UserName = z.infer<typeof userNameSchema>;

export default function UserNameSettingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<UserName>({
    resolver: zodResolver(userNameSchema),
  });

  const setUserName = api.user.setUserName.useMutation({
    onSuccess() {
      toast({
        description: "Success",
      });
      router.replace("/dashboard");
    },
    onError() {
      toast({
        description: "Something wrong, contact manager",
      });
    },
  });
  function onSubmit(values: UserName) {
    setUserName.mutate(values.username);
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-200">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Set Your Name</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="flex flex-col justify-center"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
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
        </CardContent>
      </Card>
    </div>
  );
}
