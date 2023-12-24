"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useToast } from "~/components/ui/use-toast";
export default function RegisterPage() {
  const { toast } = useToast();
  const emailAuthSchema = z.object({
    email: z.string().email({
      message: "Must be a valid email",
    }),
  });
  type EmailAuth = z.infer<typeof emailAuthSchema>;
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EmailAuth>({
    resolver: zodResolver(emailAuthSchema),
  });

  async function onSubmit(data: EmailAuth) {
    try {
      setIsLoading(true);
      await signIn("email", {
        email: `${data.email}`,
        redirect: false,
        callbackUrl: "/",
      });
      toast({
        description: "Please check your email",
      });
    } catch (err) {
      toast({
        description: "Something wrong, contact manager",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            disabled={isLoading}
            {...register("email")}
          ></Input>
          {errors?.email && (
            <p className="px-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <Button disabled={isLoading}>register</Button>
      </form>
    </div>
  );
}
