import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const invoicePeriod = await prisma.invoicePeriod.count();
  console.log(invoicePeriod);
  await prisma.invoicePeriod.create({
    data: {
      startAt: new Date("2020-03-19T14:21:00+02:00"),
      endAt: new Date("2020-03-28T14:21:00+02:00"),
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
//Temporary For Test
