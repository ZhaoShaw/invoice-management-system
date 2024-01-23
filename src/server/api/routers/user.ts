import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { UserRole } from "~/types/index.d";
import { env } from "~/env";
import { newUserSchema } from "~/lib/verification";

export const userRouter = createTRPCRouter({
  setRole: publicProcedure
    .input(z.object({ role: z.nativeEnum(UserRole) }))
    .mutation(({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          email: env.ADMIN_USER_EMAIL,
        },
        data: { role: input.role },
      });
    }),

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
      return ctx.db.user.create({
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
      await ctx.db.session.deleteMany({
        where: { userId: input.id },
      });
      if (!previous.email) {
        await ctx.db.verificationToken.deleteMany({
          where: {
            identifier: previous.email!,
          },
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
    return await ctx.db.user.findMany({});
  }),
});
