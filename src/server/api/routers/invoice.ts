import { z } from "zod";
import { UserRole, CommitStatus } from "~/types/index.d";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { invoiceCommitSchema } from "~/lib/verification";

export const invoiceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(invoiceCommitSchema)
    .mutation(async ({ ctx, input }) => {
      const invoiceCommit = await ctx.db.invoiceCommit.create({
        data: {
          totalAmount: 10,
          totalGroups: 10,
          totalItems: 10,
          invoiceGroups: {
            create: [
              {
                totalAmount: input.commit[0]?.totalAmount,
                totalItems: 10,
                purpose: input.commit[0]?.purpose,
                invoiceItems: {
                  createMany: {
                    data: [
                      {
                        invoiceItemSrc:
                          input.commit[0]?.invoiceItems[0]?.invoiceItemSrc,
                        createdUesrId: ctx.session.user.id,
                        updatedUesrId: ctx.session.user.id,
                      },
                    ],
                  },
                },
                createdUesrId: ctx.session.user.id,
                updatedUesrId: ctx.session.user.id,
              },
            ],
          },
          commitStatus: CommitStatus.NOTREVIEWED,
          commitPeriod: { connect: { id: "clqsc8ygw0000rolq5qd32qwh" } },
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
    }),
});
