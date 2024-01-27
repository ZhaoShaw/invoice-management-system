import { newPeriodSchema } from "~/lib/verification";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import { formatISO, isAfter } from "date-fns";
import { generateDateArray } from "~/lib/func";
import { env } from "~/env";
import { z } from "zod";

export const periodRouter = createTRPCRouter({
  getPeriodByDate: protectedProcedure
    .input(z.date())
    .query(async ({ ctx, input }) => {
      return await ctx.db.invoicePeriod.findFirst({
        where: {
          AND: [
            {
              startAt: {
                lte: formatISO(input),
              },
            },
            {
              endAt: {
                gte: formatISO(input),
              },
            },
          ],
        },
        select: {
          startAt: true,
          endAt: true,
        },
      });
    }),
  getPeriodArray: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        len: z.number().int().gte(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.invoicePeriod.findMany({
        take: input.len,
        where: {
          startAt: {
            gte: input.startDate,
          },
        },
        orderBy: {
          startAt: "asc",
        },
        select: {
          startAt: true,
          endAt: true,
        },
      });
    }),
  changePeriod: adminProcedure
    .input(newPeriodSchema)
    .mutation(async ({ ctx, input }) => {
      const nowPeriod = await ctx.db.invoicePeriod.findFirst({
        where: {
          AND: [
            {
              startAt: {
                lte: formatISO(Date.now()),
              },
            },
            {
              endAt: {
                gte: formatISO(Date.now()),
              },
            },
          ],
        },
      });
      if (!nowPeriod) {
        throw new Error("something happened");
      }
      await ctx.db.invoicePeriod.deleteMany({
        where: {
          startAt: {
            gte: nowPeriod.endAt,
          },
        },
      });
      const changedStartDate = formatISO(input.changeDate);

      const changedEndDate = formatISO(
        new Date(
          env.INVOICE_END_YEAR,
          env.INVOICE_END_MONTH - 1,
          env.INVOICE_END_DAY,
          0,
          0,
          0,
        ),
      );

      if (isAfter(changedStartDate, nowPeriod.endAt)) {
        await ctx.db.invoicePeriod.create({
          data: {
            startAt: nowPeriod.endAt,
            endAt: changedStartDate,
          },
        });
        const followingDate = generateDateArray(
          new Date(changedStartDate),
          new Date(changedEndDate),
          input.period,
        );
        await ctx.db.invoicePeriod.createMany({
          data: followingDate,
        });
      }
    }),
});
