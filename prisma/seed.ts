import { PrismaClient } from "@prisma/client";
import { env } from "../src/env";
import { eachMonthOfInterval, setDate, formatISO, isAfter } from "date-fns";
const prisma = new PrismaClient();

const generateData = (startDate: Date) => {
  const res = eachMonthOfInterval(
    {
      start: startDate,
      end: new Date(
        env.INVOICE_END_YEAR,
        env.INVOICE_END_MONTH,
        env.INVOICE_END_DAY,
      ),
    },
    { step: env.INVOICE_PERIOD },
  ).map((d) => formatISO(setDate(d, startDate.getDate())));
  const newArr = [];
  for (let i = 0; i < res.length - 1; i++) {
    newArr.push({ startAt: res[i]!, endAt: res[i + 1]! });
  }
  return newArr;
};

async function generateInvoicePeriod() {
  const invoicePeriod = await prisma.invoicePeriod.count();

  if (invoicePeriod === 0) {
    const res = generateData(
      new Date(
        env.INVOICE_START_YEAR,
        env.INVOICE_START_MONTH,
        env.INVOICE_START_DAY,
      ),
    );
    await prisma.invoicePeriod.createMany({
      data: res,
    });
  }

  if (
    invoicePeriod > 0 &&
    env.INVOICE_CHANGE_MONTH != 0 &&
    env.INVOICE_CHANGE_DAY != 0
  ) {
    const nowPeriod = await prisma.invoicePeriod.findFirst({
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
    await prisma.invoicePeriod.deleteMany({
      where: {
        startAt: {
          gte: nowPeriod.endAt,
        },
      },
    });
    const changedDate = formatISO(
      new Date(
        nowPeriod.endAt.getFullYear(),
        env.INVOICE_CHANGE_MONTH - 1,
        env.INVOICE_CHANGE_DAY,
        0,
        0,
        0,
      ),
    );

    if (isAfter(changedDate, nowPeriod.endAt)) {
      await prisma.invoicePeriod.create({
        data: {
          startAt: nowPeriod.endAt,
          endAt: changedDate,
        },
      });
      const followingDate = generateData(new Date(changedDate));
      await prisma.invoicePeriod.createMany({
        data: followingDate,
      });
    }
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
