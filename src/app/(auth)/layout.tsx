export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-auth-bg fixed inset-0 bg-center">
      <div className="">{children}</div>
    </div>
  );
}
