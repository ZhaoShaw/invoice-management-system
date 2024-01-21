import { z } from "zod";
import { UserRole, CommitStatus } from "~/types/index.d";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { invoiceCommitSchema } from "~/lib/verification";
import { formatISO, format } from "date-fns";
import fs from "fs";
import { without } from "lodash";
import { getTodayUploadFiles } from "~/lib/func";
import type { InvoiceItem } from "@prisma/client/index.d";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isString = (s: any): s is string => typeof s === "string";

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

  update: protectedProcedure
    .input(invoiceCommitSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.id === undefined) {
        return;
      }

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
      const previousGroups = await ctx.db.invoiceGroup.findMany({
        where: {
          invoiceCommitId: input.id,
        },
      });

      const deleteList = without(
        previousGroups.map((g) => g.id),
        ...input.commit.map((i) => i.id).filter(isString),
      );
      // console.log(deleteList);
      if (deleteList.length !== 0) {
        await ctx.db.invoiceGroup.deleteMany({
          where: {
            id: { in: deleteList },
          },
        });
      }

      for (const group of input.commit) {
        if (group.id) {
          await ctx.db.invoiceGroup.update({
            where: {
              id: group.id,
            },
            data: {
              totalAmount: group.totalAmount,
              purpose: group.purpose,
              totalItems: group.invoiceItems.length,
              updatedUesrId: ctx.session.user.id,
            },
          });

          const previousItems = await ctx.db.invoiceItem.findMany({
            where: {
              invoiceGroupId: group.id,
            },
          });

          const deleteList = without(
            previousItems.map((i) => i.id),
            ...group.invoiceItems.map((i) => i.id).filter(isString),
          );
          // console.log(deleteList);
          if (deleteList.length !== 0) {
            await ctx.db.invoiceItem.deleteMany({
              where: {
                id: { in: deleteList },
              },
            });
          }
          for (const item of group.invoiceItems) {
            if (item.id && previousItems.map((i) => i.id).includes(item.id)) {
              await ctx.db.invoiceItem.update({
                where: {
                  id: item.id,
                },
                data: {
                  invoiceItemSrc: item.invoiceItemSrc,
                  updatedUesrId: ctx.session.user.id,
                },
              });
            } else {
              await ctx.db.invoiceItem.create({
                data: {
                  invoiceItemSrc: item.invoiceItemSrc,
                  createdUesrId: ctx.session.user.id,
                  updatedUesrId: ctx.session.user.id,
                  invoiceGroupId: group.id,
                  invoiceCommitId: input.id,
                },
              });
            }
          }
        } else {
          await ctx.db.invoiceGroup.create({
            data: {
              totalAmount: group.totalAmount,
              purpose: group.purpose,
              totalItems: group.invoiceItems.length,
              invoiceItems: {
                create: group.invoiceItems.map((invoiceItem) => {
                  return {
                    invoiceItemSrc: invoiceItem.invoiceItemSrc,
                    invoiceCommitId: input.id,
                    createdUesrId: ctx.session.user.id,
                    updatedUesrId: ctx.session.user.id,
                  };
                }),
              },
              createdUesrId: ctx.session.user.id,
              updatedUesrId: ctx.session.user.id,
              invoiceCommitId: input.id,
            },
            include: {
              invoiceItems: true,
            },
          });
        }
      }
      await ctx.db.invoiceCommit.update({
        where: {
          id: input.id,
        },
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
          commitPeriod: { connect: { id: nowPeriod?.id } },
          updatedBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getByCommitId: protectedProcedure
    .input(z.string().min(1).optional())
    .query(async ({ ctx, input }) => {
      if (input) {
        const invoiceCommit = await ctx.db.invoiceCommit.findFirst({
          where: {
            id: input,
          },
          include: {
            invoiceGroups: {
              include: {
                invoiceItems: true,
              },
            },
          },
        });
        return invoiceCommit;
      } else {
        return null;
      }
    }),

  getInvoiceCommitListByUser: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.invoiceCommit.findMany({
      where: {
        createdBy: { id: ctx.session.user.id },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }),

  getInvoiceCommitList: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.invoiceCommit.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        updatedBy: {
          select: {
            email: true,
          },
        },
      },
    });
  }),

  getInvoiceSrcListByCommitId: protectedProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const invoiceItems = await ctx.db.invoiceItem.findMany({
        where: {
          invoiceCommitId: input,
        },
      });
      return invoiceItems.map((i) => i.invoiceItemSrc);
    }),

  getInvoiceGroupsByCommitId: protectedProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      return await ctx.db.invoiceGroup.findMany({
        where: {
          invoiceCommitId: input,
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

  getUnassignedInvoiceItems: protectedProcedure
    .input(z.string().min(1).optional())
    .query(async ({ ctx, input }) => {
      let invoiceItems: InvoiceItem[] = [];
      if (input) {
        invoiceItems = await ctx.db.invoiceItem.findMany({});
      }
      const userId = ctx.session.user.id;
      const unassigned = getTodayUploadFiles(
        userId,
        invoiceItems.map((i) => i.invoiceItemSrc),
      );
      return unassigned.map((f) => ({
        id: null,
        dragId: f.substring(f.lastIndexOf("/") + 1, f.indexOf(".")),
        src: f,
      }));
    }),
});
