import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
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
});
