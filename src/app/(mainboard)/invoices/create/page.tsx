"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { type InvoiceCommit, InvoiceGroupPurpose } from "~/types/index.d";
import { invoiceCommitSchema } from "~/lib/verification";
import Icon from "~/components/icon";
import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Create() {
  const [uploading, setUploading] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<string[]>();
  const { toast } = useToast();

  useEffect(() => {
    const getItems = async () => {
      const res = await fetch("/api/upload", { method: "get" });
      const data = (await res.json()) as string[];
      setInvoiceItems(data);
    };
    getItems().catch(console.error);
  }, [uploading]);

  const invoiceCreate = api.invoice.create.useMutation({
    onSuccess: () => {
      toast({ description: "success" });
    },
    onError: (error) => {
      toast({ description: "error" });
    },
  });
  const form = useForm<InvoiceCommit>({
    resolver: zodResolver(invoiceCommitSchema),
    defaultValues: {
      commit: [
        {
          totalAmount: "",
          purpose: InvoiceGroupPurpose.OTHER,
          invoiceItems: [{ invoiceItemSrc: "https://" }],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "commit",
    control: form.control,
    rules: {
      required: "Please append at least 1 item",
    },
  });
  function onSubmit(values: InvoiceCommit) {
    // console.log(values);
    invoiceCreate.mutate(values);
  }

  async function handleFilesSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setUploading(true);
    toast({ description: "uploading..." });
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const formData = new FormData();
      files.forEach((file, i) => {
        formData.append(file.name, file);
      });
      await fetch("/api/upload", {
        method: "post",
        body: formData,
      });
    }
    setUploading(false);
    toast({ description: "uploaded!" });
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2"
        >
          <div className="bg-purple-100">
            <section className="grid grid-cols-3 items-end gap-2 px-2 py-4">
              <FormLabel>Amount</FormLabel>
              <FormLabel>Purpose</FormLabel>
            </section>
            {fields.map((field, index) => {
              return (
                <section
                  className="mt-4 grid grid-cols-3 items-start gap-2 px-2"
                  key={field.id}
                >
                  <FormField
                    control={form.control}
                    name={`commit.${index}.totalAmount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`commit.${index}.purpose`}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(InvoiceGroupPurpose).map((i) => (
                              <SelectItem key={i} value={i}>
                                {i}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Icon name="x-circle" />
                  </Button>
                </section>
              );
            })}
            <Button
              onClick={() => {
                append({
                  totalAmount: "",
                  purpose: InvoiceGroupPurpose.OTHER,
                  invoiceItems: [{ invoiceItemSrc: "https://" }],
                });
              }}
            >
              Append
            </Button>
          </div>
          <div className="bg-green-100">
            <Input
              disabled={uploading}
              type="file"
              multiple
              onChange={handleFilesSelect}
              accept=".pdf,.png,.jpeg,.jpg "
            />
            <div>
              {invoiceItems?.map((i) => (
                <Image key={i} src={i} alt="1" width={300} height={300} />
              ))}
            </div>
          </div>
          <Button className="fixed inset-x-0 bottom-0 bg-red-100" type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
