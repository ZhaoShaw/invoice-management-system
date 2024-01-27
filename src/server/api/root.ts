import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/user";
import { invoiceRouter } from "./routers/invoice";
import { periodRouter } from "./routers/period";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  invoice: invoiceRouter,
  period: periodRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
