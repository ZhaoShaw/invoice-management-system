import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { type DateRange } from "react-day-picker";
import { subDays, format } from "date-fns";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { type Table } from "@tanstack/react-table";
import { Input } from "~/components/ui/input";

interface TableToolbarProps<TData> {
  table: Table<TData>;
  isAdmin?: boolean;
}

export function TableToolbar<TData>({
  table,
  isAdmin = false,
}: TableToolbarProps<TData>) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(Date.now(), 30),
    to: new Date(Date.now()),
  });
  return (
    <div>
      {isAdmin && (
        <Input
          placeholder="Enter Name"
          value={
            (table.getColumn("updatedBy")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) => {
            table.getColumn("updatedBy")?.setFilterValue(event.target.value);
          }}
        />
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button id="date" variant={"outline"}>
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd,y")} -{" "}
                  {format(date.to, "LLL dd,y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(e: DateRange | undefined) => {
              setDate(e);
              table.getColumn("updatedAt")?.setFilterValue(e);
            }}
            numberOfMonths={2}
          ></Calendar>
        </PopoverContent>
      </Popover>

      <Button asChild>
        <Link href="/invoices/create">Create Commit</Link>
      </Button>
    </div>
  );
}
