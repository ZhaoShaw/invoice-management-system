import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import { UserRole } from "~/types/index.d";
import BodyLayout from "~/components/body-layout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  if (session.user.name === undefined || !session.user.name) {
    redirect("/common/username");
  }

  return (
    <BodyLayout
      isInAdmin={true}
      user={session.user}
      children={children}
    ></BodyLayout>
  );
}
