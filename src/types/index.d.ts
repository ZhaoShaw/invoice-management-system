import {
  type invoiceCommitSchema,
  type invoiceGroupSchema,
  type newUserSchema,
  type newPeriodSchema,
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
}

export enum InvoiceGroupPurpose {
  CATERING = "CATERING",
  TRAFFIC = "TRAFFIC",
  OTHER = "OTHER",
}

export enum UserStatus {
  ALLOW = "ALLOW",
  FORBIDDEN = "FORBIDDEN",
}

export type InvoiceCommit = z.infer<typeof invoiceCommitSchema>;

export type InvoiceGroup = z.infer<typeof invoiceGroupSchema>;

export type NewUser = z.infer<typeof newUserSchema>;

export type NewPeriod = z.infer<typeof newPeriodSchema>;
