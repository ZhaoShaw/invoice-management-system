import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { UserRole } from "~/types/index.d";
import { env } from "~/env";

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
});
