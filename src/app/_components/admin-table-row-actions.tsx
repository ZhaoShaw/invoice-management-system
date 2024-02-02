import { type Row } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";

import { useRouter } from "next/navigation";
import { ExportActions } from "./export-actions";
import { View } from "lucide-react";

interface TableRowActionsProps<TData> {
  row: Row<TData>;
}
export function AdminTableRowActions<TData>({
  row,
}: TableRowActionsProps<TData>) {
  const commitId: string = row.getValue("id");
  const router = useRouter();
  return (
    <div>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            router.push(`/admin/invoices/query/${commitId}`);
          }}
        >
          <View />
        </Button>
        <ExportActions commitId={commitId} />
      </div>
    </div>
  );
}
