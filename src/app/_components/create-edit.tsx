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
import {
  type InvoiceCommit,
  InvoiceGroupPurpose,
  InvoiceGroup,
} from "~/types/index.d";
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
import { useRouter } from "next/navigation";
import _ from "lodash";
import Link from "next/link";

type InvoiceItemDrag = {
  id: string | null;
  dragId: string;
  src: string;
};

export default function CreateEdit({
  isQueryMode = false,
  commitId,
}: {
  isQueryMode: boolean;
  commitId: string | undefined;
}) {
  const isAddMode = !commitId;
  const router = useRouter();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectGroup, setSelectGroup] = useState("ROOTITEMS");
  const [invoiceItemsMap, setInvoiceItemsMap] = useState<
    Map<string, InvoiceItemDrag[]>
  >(new Map([["ROOTITEMS", []]]));

  const updateMap = (k: string, v: InvoiceItemDrag[]) => {
    setInvoiceItemsMap(new Map(invoiceItemsMap.set(k, v)));
  };

  const deleteMap = (k: string) => {
    invoiceItemsMap.delete(k);
    setInvoiceItemsMap(new Map(invoiceItemsMap));
  };

  const changeIndex = (deletedIndex: number) => {
    invoiceItemsMap.forEach((value, key, map) => {
      if (Number(key.substring(5)) > deletedIndex) {
        const newKey = "GROUP" + (Number(key.substring(5)) - 1);
        map.set(newKey, value);
      }
    });
    invoiceItemsMap.delete(`GROUP${invoiceItemsMap.size - 2}`);
    setInvoiceItemsMap(new Map(invoiceItemsMap));
  };

  const unassignedInvoiceItems = api.invoice.getUnassignedInvoiceItems.useQuery(
    commitId,
    {
      enabled: false,
    },
  );
  const invoiceCommitEntry = api.invoice.getByCommitId.useQuery(commitId, {
    enabled: false,
  });

  const form = useForm<InvoiceCommit>({
    resolver: zodResolver(invoiceCommitSchema),
  });

  const { fields, append, remove, update } = useFieldArray({
    name: "commit",
    control: form.control,
    rules: {
      required: "Please append at least 1 item",
    },
  });

  useEffect(() => {
    const fetchUnassignedInvoiceItems = async () => {
      const res = await unassignedInvoiceItems.refetch();
      if (res.data !== undefined) {
        let assignedItems: string[] = [];
        invoiceItemsMap.forEach((value, key) => {
          if (key !== "ROOTITEMS") {
            assignedItems = assignedItems.concat(value.map((i) => i.src));
          }
        });
        _.remove(res.data, function (i) {
          return assignedItems.includes(i.src);
        });
        updateMap("ROOTITEMS", res.data);
      }
    };
    fetchUnassignedInvoiceItems().catch(console.error);
  }, [uploading]);

  useEffect(() => {
    const fetchInvoiceCommitEntry = async () => {
      const res = await invoiceCommitEntry.refetch();
      if (res.data !== null && res.data !== undefined) {
        res.data.invoiceGroups.forEach((g, index) => {
          update(index, {
            id: g.id,
            totalAmount: g.totalAmount.toString(),
            purpose: g.purpose as InvoiceGroupPurpose,
            invoiceItems: g.invoiceItems.map((i) => {
              return {
                id: i.id,
                invoiceItemSrc: i.invoiceItemSrc,
              };
            }),
          });
          updateMap(
            `GROUP${index}`,
            g.invoiceItems.map((i) => {
              return {
                id: i.id,
                dragId: i.invoiceItemSrc.substring(
                  i.invoiceItemSrc.lastIndexOf("/") + 1,
                  i.invoiceItemSrc.indexOf("."),
                ),
                src: i.invoiceItemSrc,
              };
            }),
          );
        });

        if (isQueryMode) {
          setSelectGroup("GROUP0");
        }
      }
    };
    fetchInvoiceCommitEntry().catch(console.error);
  }, []);

  const invoiceCreate = api.invoice.create.useMutation({
    onSuccess: () => {
      toast({ description: "success" });
      router.push("/dashboard");
    },
    onError: () => {
      toast({ description: "error" });
    },
  });

  const invoiceEdit = api.invoice.update.useMutation({
    onSuccess: () => {
      toast({ description: "success" });
      router.push("/dashboard");
    },
    onError: () => {
      toast({ description: "error" });
    },
  });

  function onSubmit(values: InvoiceCommit) {
    values.id = commitId;
    values.commit.forEach((group, index) => {
      const invoiceSrcs = invoiceItemsMap.get(`GROUP${index}`)?.map((i) => {
        return {
          id: i.id,
          invoiceItemSrc: i.src,
        };
      });
      if (invoiceSrcs !== undefined && invoiceSrcs.length !== 0) {
        group.invoiceItems = invoiceSrcs;
      } else {
        toast({ description: "Every item needs at least one invoice" });
        throw new Error("Invoice can't be null");
      }
    });
    console.log(values);
    if (isAddMode) {
      invoiceCreate.mutate(values);
    } else {
      invoiceEdit.mutate(values);
    }
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
    // deleteMap(`GROUP${index}`);
    changeIndex(index);
  }

  const approve = api.invoice.handleApprove.useMutation({
    onSuccess(data, variables, context) {
      toast({
        description: `${variables.approve ? "Approved" : "Unapproved"}`,
      });
      router.push("/admin/dashboard");
    },
    onError() {
      toast({
        description: "error",
      });
    },
  });
  function handleApprove() {
    approve.mutate({ approve: true, commitId: commitId! });
  }

  function handleUnapprove() {
    approve.mutate({ approve: false, commitId: commitId! });
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
                          " mt-4 grid grid-cols-3 items-start gap-2 px-2 py-5"
                        }
                        key={field.id}
                      >
                        <FormField
                          control={form.control}
                          disabled={isQueryMode}
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
                                disabled={isQueryMode}
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
                          {!isQueryMode && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                remove(index);
                                removeGroupInvoiceItems(index);
                              }}
                            >
                              <Icon name="x-circle" />
                            </Button>
                          )}
                          <Button
                            type="button"
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
                        <div className="hidden">{provided.placeholder}</div>
                      </section>
                    )}
                  </Droppable>
                );
              })}

              {!isQueryMode && (
                <div className="space-x-2">
                  <Button
                    type="button"
                    onClick={() => {
                      append({
                        id: null,
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
                    type="button"
                    onClick={() => {
                      setSelectGroup("ROOTITEMS");
                    }}
                  >
                    Show Rest Invoices
                  </Button>
                </div>
              )}
            </div>
            <div className="bg-green-100">
              {!isQueryMode && (
                <Input
                  disabled={uploading}
                  type="file"
                  multiple
                  onChange={handleFilesSelect}
                  accept=".pdf,.png,.jpeg,.jpg "
                />
              )}
              <Droppable droppableId={selectGroup}>
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {invoiceItemsMap.get(selectGroup).map((i, index) => {
                      return (
                        <Draggable
                          key={i.dragId}
                          draggableId={i.dragId}
                          index={index}
                          isDragDisabled={isQueryMode}
                        >
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
          {!isQueryMode ? (
            <Button
              className="fixed inset-x-0 bottom-0 bg-red-100"
              type="submit"
            >
              Submit
            </Button>
          ) : (
            <div className="fixed inset-x-0 bottom-0 flex justify-center space-x-10 bg-red-100">
              <Button type="button" onClick={handleApprove}>
                Approve
              </Button>
              <Button type="button" variant="outline" onClick={handleUnapprove}>
                Unapprove
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}