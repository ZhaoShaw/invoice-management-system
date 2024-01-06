import { z } from "zod";
import { UserRole, CommitStatus } from "~/types/index.d";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { invoiceCommitSchema } from "~/lib/verification";
import { formatISO } from "date-fns";

export const invoiceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(invoiceCommitSchema)
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
      const invoiceCommit = await ctx.db.invoiceCommit.create({
        data: {
          totalAmount: input.commit.reduce(
            (sum, i) => sum + parseFloat(i.totalAmount),
            0,
          ),
          totalGroups: input.commit.length,
          totalItems: input.commit.reduce(
            (sum, i) => sum + i.invoiceItems.length,
            0,
          ),
          invoiceGroups: {
            create: input.commit.map((invoiceGroup) => {
              return {
                totalAmount: invoiceGroup.totalAmount,
                totalItems: invoiceGroup.invoiceItems.length,
                purpose: invoiceGroup.purpose,
                invoiceItems: {
                  create: invoiceGroup.invoiceItems.map((invoiceItem) => {
                    return {
                      invoiceItemSrc: invoiceItem.invoiceItemSrc,
                      createdUesrId: ctx.session.user.id,
                      updatedUesrId: ctx.session.user.id,
                    };
                  }),
                },
                createdUesrId: ctx.session.user.id,
                updatedUesrId: ctx.session.user.id,
              };
            }),
          },
          commitStatus: CommitStatus.NOTREVIEWED,
          commitPeriod: { connect: { id: nowPeriod?.id } },
          createdBy: { connect: { id: ctx.session.user.id } },
          updatedBy: { connect: { id: ctx.session.user.id } },
        },
        include: {
          invoiceGroups: {
            include: {
              invoiceItems: true,
            },
          },
        },
      });
      const commitRelation = await ctx.db.invoiceItem.updateMany({
        where: {
          invoiceGroupId: {
            in: invoiceCommit.invoiceGroups.map((i) => i.id),
          },
        },
        data: {
          invoiceCommitId: invoiceCommit.id,
        },
      });
    }),

  getInvoiceCommitListByUser: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.invoiceCommit.findMany({
      where: {
        createdBy: { id: ctx.session.user.id },
      },
    });
  }),

  deleteInvoiceCommitById: protectedProcedure
    .input(z.string().min(1))
    .mutation(async ({ ctx, input }) => {
      const invoiceCommit = ctx.db.invoiceCommit.delete({
        where: {
          id: input,
        },
      });
      const invoiceGroup = ctx.db.invoiceGroup.deleteMany({
        where: {
          invoiceCommitId: input,
        },
      });
      const invoiceItem = ctx.db.invoiceItem.deleteMany({
        where: {
          invoiceCommitId: input,
        },
      });
      await ctx.db.$transaction([invoiceCommit, invoiceGroup, invoiceItem]);
    }),
});
