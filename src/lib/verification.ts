import * as z from "zod";
import { InvoiceGroupPurpose } from "~/types/index.d";

export const invoiceItemSchema = z.object({
  invoiceItemSrc: z.string(),
});
export const invoiceGroupSchema = z.object({
  totalAmount: z
    .string()
    .regex(
      new RegExp(/^([1-9]\d{0,9}|0)(\.\d{1,2})?$/),
      "Please input right amount",
    )
    .refine(
      (s) => s.split("").filter((c) => c !== "." && c !== "0").length > 0,
      {
        message: "Please input right amount",
      },
    ),
  purpose: z.nativeEnum(InvoiceGroupPurpose),
  invoiceItems: z.array(invoiceItemSchema),
});

export const invoiceCommitSchema = z.object({
  commit: z.array(invoiceGroupSchema),
});
