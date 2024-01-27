"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { type NewPeriod } from "~/types/index.d";
import { newPeriodSchema } from "~/lib/verification";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { Button } from "~/components/ui/button";
import { format, formatISO } from "date-fns";
import { Input } from "~/components/ui/input";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";

interface PeriodNow {
  startAt: Date | null;
  endAt: Date | null;
}

export default function PeriodPage() {
  const { toast } = useToast();
  const [periodNowState, setPeriodNowState] = useState<PeriodNow>({
    startAt: null,
    endAt: null,
  });
  const [periodArrayState, setPeriodArrayState] = useState<PeriodNow[]>([
    {
      startAt: null,
      endAt: null,
    },
  ]);

  const now = formatISO(Date.now());
  const periodNow = api.period.getPeriodByDate.useQuery(new Date(now), {
    enabled: false,
  });
  const periodNext = api.period.getPeriodArray.useQuery(
    {
      startDate: new Date(now),
      len: 2,
    },
    {
      enabled: false,
    },
  );

  const getPeriodNow = async () => {
    const resNow = await periodNow.refetch();
    const resArray = await periodNext.refetch();
    if (resNow.data) {
      setPeriodNowState(resNow.data);
      form.setValue("changeDate", resNow.data.endAt);
    }

    if (resArray.data) {
      setPeriodArrayState(resArray.data);
    }
  };

  const updatePeriod = api.period.changePeriod.useMutation({
    onSuccess: async () => {
      await getPeriodNow();
      toast({ description: "success" });
    },
    onError: () => {
      toast({ description: "error" });
    },
  });

  useEffect(() => {
    getPeriodNow().catch(console.error);
  }, []);

  const form = useForm<NewPeriod>({
    resolver: zodResolver(newPeriodSchema),
    defaultValues: {
      changeDate: new Date(),
      period: 2,
    },
  });

  function onSubmit(values: NewPeriod) {
    updatePeriod.mutate(values);
  }

  return (
    <div>
      <div>
        {"Period Now: "}
        {periodNowState.startAt
          ? periodNowState.startAt.toLocaleDateString()
          : ""}
        -{periodNowState.endAt ? periodNowState.endAt.toLocaleDateString() : ""}
      </div>
      <div>
        {periodArrayState.map((p, index) => (
          <div>
            {`Period + ${index + 1}: `}
            {p.startAt ? p.startAt.toLocaleDateString() : ""} -
            {p.endAt ? p.endAt.toLocaleDateString() : ""}
          </div>
        ))}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="changeDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Change Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline">
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a Date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      month={
                        periodNowState.endAt ? periodNowState.endAt : new Date()
                      }
                      disabled={(date) =>
                        date <
                        (periodNowState.endAt
                          ? periodNowState.endAt
                          : new Date())
                      }
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Period</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
          <Button type="submit">OK</Button>
        </form>
      </Form>
    </div>
  );
}
