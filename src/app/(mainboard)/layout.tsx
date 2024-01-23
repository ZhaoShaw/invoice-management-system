import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import BodyLayout from "~/components/body-layout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login");
  }

  if (session.user.name === undefined || !session.user.name) {
    redirect("/common/username");
  }

  return (
    <div>
      <BodyLayout user={session.user} children={children}></BodyLayout>
    </div>
  );
}
