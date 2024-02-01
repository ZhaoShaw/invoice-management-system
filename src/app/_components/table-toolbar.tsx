import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { type DateRange } from "react-day-picker";
import { subDays, format, formatISO } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { type Table } from "@tanstack/react-table";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

interface TableToolbarProps<TData> {
  table: Table<TData>;
  isAdmin?: boolean;
}

interface PeriodNow {
  startAt: Date | null;
  endAt: Date | null;
}

export function TableToolbar<TData>({
  table,
  isAdmin = false,
}: TableToolbarProps<TData>) {
  const now = formatISO(Date.now());
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(Date.now(), 30),
    to: new Date(Date.now()),
  });

  const [periodNowState, setPeriodNowState] = useState<PeriodNow>({
    startAt: null,
    endAt: null,
  });

  const periodNow = api.period.getPeriodByDate.useQuery(new Date(now), {
    enabled: false,
  });

  const getPeriodNow = async () => {
    const resNow = await periodNow.refetch();
    if (resNow.data) {
      setPeriodNowState(resNow.data);
    }
  };

  useEffect(() => {
    getPeriodNow().catch(console.error);
  }, []);

  const handleSetPeriodNow = () => {
    const period: DateRange = {
      from: periodNowState.startAt!,
      to: periodNowState.endAt!,
    };
    setDate(period);
    table.getColumn("updatedAt")?.setFilterValue(period);
  };
  return (
    <div>
      <div>
        <div>
          {"Period Now: "}
          {periodNowState.startAt
            ? periodNowState.startAt.toLocaleDateString()
            : ""}
          -
          {periodNowState.endAt
            ? periodNowState.endAt.toLocaleDateString()
            : ""}
        </div>
        <Button onClick={handleSetPeriodNow}>View Period Now</Button>
      </div>
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
