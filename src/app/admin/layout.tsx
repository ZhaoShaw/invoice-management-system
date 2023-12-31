import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import { UserRole } from "~/types/index.d";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/");
  }
  return <div>{children}</div>;
}
