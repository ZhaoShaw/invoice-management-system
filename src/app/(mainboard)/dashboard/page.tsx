import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Dashboard() {
  return (
    <div>
      <Button asChild>
        <Link href="/invoices/create">Create Commit</Link>
      </Button>
      {[...Array(100).keys()].map((i) => (
        <div>Dashboard</div>
      ))}
    </div>
  );
}
