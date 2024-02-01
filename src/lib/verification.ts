import * as z from "zod";
import { InvoiceGroupPurpose, UserStatus } from "~/types/index.d";

export const invoiceItemSchema = z.object({
  id: z.string().min(1).nullable(),
  invoiceItemSrc: z.string(),
});
export const invoiceGroupSchema = z.object({
  id: z.string().min(1).nullable(),
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
  id: z.string().min(1).optional(),
  commit: z.array(invoiceGroupSchema),
});

export const newUserSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  email: z.string().email({
    message: "Must be a valid email",
  }),
});

export const setUserStatusSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(UserStatus),
});

export const newPeriodSchema = z.object({
  changeDate: z.date().min(new Date(), { message: "Can't be setted" }),
  period: z.coerce.number().int().gte(1).lte(12),
});

export const getInvoiceCommitsSchema = z.object({
  userId: z.string().min(1).optional(),
  userName: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  pageIndex: z.number().int().gte(0),
  pageSize: z.number().int().gte(1),
});
