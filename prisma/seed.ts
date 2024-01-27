import { PrismaClient } from "@prisma/client";
import { env } from "../src/env";
import { generateDateArray } from "~/lib/func";
const prisma = new PrismaClient();

async function generateInvoicePeriod() {
  const invoicePeriod = await prisma.invoicePeriod.count();

  if (invoicePeriod === 0) {
    const res = generateDateArray(
      new Date(
        env.INVOICE_START_YEAR,
        env.INVOICE_START_MONTH,
        env.INVOICE_START_DAY,
      ),
      new Date(
        env.INVOICE_END_YEAR,
        env.INVOICE_END_MONTH,
        env.INVOICE_END_DAY,
      ),
      env.INVOICE_PERIOD,
    );
    await prisma.invoicePeriod.createMany({
      data: res,
    });
  }
}

// async function generateInvoiceEnum() {
//   const invoiceEnum = await prisma.invoiceEnum.count();
//   if (invoiceEnum === 0) {
//     await prisma.invoiceEnum.createMany({
//       data: [
//         {
//           enumType: "INVOICE_GROUP_PURPOSE",
//           enumName: "TRAFFIC",
//           enumValue: "TRAFFIC",
//         },
//         {
//           enumType: "INVOICE_GROUP_PURPOSE",
//           enumName: "CATERING",
//           enumValue: "CATERING",
//         },
//         {
//           enumType: "INVOICE_GROUP_PURPOSE",
//           enumName: "OTHER",
//           enumValue: "OTHER",
//         },
//       ],
//     });
//   }
// }

async function main() {
  await generateInvoicePeriod();
  // await generateInvoiceEnum();
}

main()
  .then(async () => {
    // await prisma.invoicePeriod.deleteMany({});
    // await prisma.invoiceEnum.deleteMany({});
    // const invoiceCommit = prisma.invoiceCommit.deleteMany({});
    // const invoiceGroup = prisma.invoiceGroup.deleteMany({});
    // const invoiceItem = prisma.invoiceItem.deleteMany({});
    // await prisma.$transaction([invoiceCommit, invoiceGroup, invoiceItem]);
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
