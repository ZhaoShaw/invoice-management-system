import {
  type invoiceCommitSchema,
  type invoiceGroupSchema,
} from "~/lib/verification";
import type * as z from "zod";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum AuthStage {
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
}

export enum CommitStatus {
  NOTREVIEWED = "NOTREVIEWED",
  REVIEWED = "REVIEWED",
  EXPIRED = "EXPIRED",
}

export enum InvoiceGroupPurpose {
  CATERING = "CATERING",
  TRAFFIC = "TRAFFIC",
  OTHER = "OTHER",
}

export type InvoiceCommit = z.infer<typeof invoiceCommitSchema>;

export type InvoiceGroup = z.infer<typeof invoiceGroupSchema>;
