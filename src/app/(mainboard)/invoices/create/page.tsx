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
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";

type InvoiceItemDrag = {
  id: string;
  src: string;
};

export default function Create() {
  const [uploading, setUploading] = useState(false);
  const [selectGroup, setSelectGroup] = useState("ROOTITEMS");
  const [invoiceItemsMap, setInvoiceItemsMap] = useState<
    Map<string, InvoiceItemDrag[]>
  >(new Map([["ROOTITEMS", []]]));
  const { toast } = useToast();

  const updateMap = (k: string, v: InvoiceItemDrag[]) => {
    setInvoiceItemsMap(new Map(invoiceItemsMap.set(k, v)));
  };

  const deleteMap = (k: string) => {
    invoiceItemsMap.delete(k);
    setInvoiceItemsMap(new Map(invoiceItemsMap));
  };

  useEffect(() => {
    const getItems = async () => {
      const res = await fetch("/api/upload", { method: "get" });
      const data = (await res.json()) as InvoiceItemDrag[];
      updateMap("ROOTITEMS", data);
    };
    getItems().catch(console.error);
  }, [uploading]);

  const invoiceCreate = api.invoice.create.useMutation({
    onSuccess: () => {
      toast({ description: "success" });
    },
    onError: () => {
      toast({ description: "error" });
    },
  });
  const form = useForm<InvoiceCommit>({
    resolver: zodResolver(invoiceCommitSchema),
    // defaultValues: {
    //   commit: [
    //     {
    //       totalAmount: "",
    //       purpose: InvoiceGroupPurpose.OTHER,
    //       invoiceItems: [{ invoiceItemSrc: "https://" }],
    //     },
    //   ],
    // },
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
      files.forEach((file) => {
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

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    if (destination.droppableId === source.droppableId) {
      const sourceList = invoiceItemsMap.get(source.droppableId);
      const [removed] = sourceList?.splice(source.index, 1);
      sourceList?.splice(destination.index, 0, removed);
      updateMap(source.droppableId, sourceList);
    } else {
      const destinationList = invoiceItemsMap.get(destination.droppableId);
      const sourceList = invoiceItemsMap.get(source.droppableId);
      updateMap(
        destination.droppableId,
        destinationList?.concat(sourceList[source.index]),
      );
      sourceList?.splice(source.index, 1);
      updateMap(source.droppableId, sourceList);
    }

    console.log(invoiceItemsMap);
  }

  function removeGroupInvoiceItems(index: number) {
    const rootList = invoiceItemsMap.get("ROOTITEMS");
    const removeList = invoiceItemsMap.get(`GROUP${index}`);
    updateMap("ROOTITEMS", rootList.concat(removeList));
    deleteMap(`GROUP${index}`);
    console.log(invoiceItemsMap);
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2"
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="bg-purple-100">
              <section className="grid grid-cols-3 items-end gap-2 px-2 py-4">
                <FormLabel>Amount</FormLabel>
                <FormLabel>Purpose</FormLabel>
              </section>
              {fields.map((field, index) => {
                return (
                  <Droppable
                    key={`GROUP${index}`}
                    droppableId={`GROUP${index}`}
                  >
                    {(provided, snapshot) => (
                      <section
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={
                          (snapshot.isDraggingOver ? "bg-blue-200" : "") +
                          " mt-4 grid grid-cols-3 items-start gap-2 px-2"
                        }
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
                                  {Object.values(InvoiceGroupPurpose).map(
                                    (i) => (
                                      <SelectItem key={i} value={i}>
                                        {i}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              remove(index);
                              removeGroupInvoiceItems(index);
                            }}
                          >
                            <Icon name="x-circle" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectGroup(`GROUP${index}`);
                            }}
                          >
                            <Icon name="folder-closed" />
                            {invoiceItemsMap.get(`GROUP${index}`)?.length}
                          </Button>
                        </div>
                        {provided.placeholder}
                      </section>
                    )}
                  </Droppable>
                );
              })}
              <div className="space-x-2">
                <Button
                  onClick={() => {
                    append({
                      totalAmount: "",
                      purpose: InvoiceGroupPurpose.OTHER,
                      invoiceItems: [],
                    });
                    updateMap(`GROUP${fields.length}`, []);
                  }}
                >
                  Append
                </Button>
                <Button
                  onClick={() => {
                    setSelectGroup("ROOTITEMS");
                  }}
                >
                  Show Rest Invoices
                </Button>
              </div>
            </div>
            <div className="bg-green-100">
              <Input
                disabled={uploading}
                type="file"
                multiple
                onChange={handleFilesSelect}
                accept=".pdf,.png,.jpeg,.jpg "
              />
              <Droppable droppableId={selectGroup}>
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {invoiceItemsMap.get(selectGroup).map((i, index) => {
                      return (
                        <Draggable key={i.id} draggableId={i.id} index={index}>
                          {(provided, snapshot) => {
                            return (
                              <Image
                                src={i.src}
                                alt="1"
                                width={300}
                                height={300}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              />
                            );
                          }}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
          <Button className="fixed inset-x-0 bottom-0 bg-red-100" type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
