export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-auth-bg bg-center">
      <div className="">{children}</div>
    </div>
  );
}
