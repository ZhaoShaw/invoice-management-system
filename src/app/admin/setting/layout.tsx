import { SidebarNav } from "./_components/sidebar-nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  const items = [
    { title: "User", href: "/admin/setting/user" },
    { title: "Period", href: "/admin/setting/period" },
  ];
  return (
    <div className="flex ">
      <aside className="w-1/5">
        <SidebarNav items={items} />
      </aside>
      <div>{children}</div>
    </div>
  );
}
