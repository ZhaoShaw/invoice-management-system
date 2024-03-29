import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { UserRole } from "~/types/index.d";
import { env } from "~/env";
import { newUserSchema, setUserStatusSchema } from "~/lib/verification";
import { db } from "~/server/db";
import { UserStatus } from "~/types/index.d";

const clearVerification = async ({
  userId,
  identifier,
}: {
  userId: string;
  identifier: string | null;
}) => {
  await db.session.deleteMany({
    where: { userId: userId },
  });

  if (identifier) {
    await db.verificationToken.deleteMany({
      where: {
        identifier: identifier,
      },
    });
  }
};

export const userRouter = createTRPCRouter({
  setUserName: protectedProcedure
    .input(z.string().min(1))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input,
        },
      });
    }),

  createUser: adminProcedure
    .input(newUserSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
        },
      });
    }),

  updateUser: adminProcedure
    .input(newUserSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        return;
      }
      const previous = await ctx.db.user.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!previous) {
        return;
      }
      await ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          email: input.email,
        },
      });
      await clearVerification({ userId: input.id, identifier: previous.email });
    }),

  setUserStatus: adminProcedure
    .input(setUserStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const previous = await ctx.db.user.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!previous) {
        return;
      }
      await ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
        },
      });

      if (input.status === UserStatus.FORBIDDEN) {
        await clearVerification({
          userId: input.id,
          identifier: previous.email,
        });
      }
    }),

  getUserBySessionToken: protectedProcedure
    .input(
      z.object({
        sessionToken: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.session.findFirst({
        where: {
          sessionToken: input.sessionToken,
        },
      });
    }),

  getAllUsers: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),

  isUser: publicProcedure
    .input(z.string().email())
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          email: input,
        },
      });
      return user ? true : false;
    }),
});
