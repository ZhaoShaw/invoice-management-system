import { type User } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import UserSettingActions from "./user-setting-actions";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "Id",
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <UserSettingActions />,
  },
];