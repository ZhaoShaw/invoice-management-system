import Link from "next/link";

export default async function LoginPage() {
  return (
    <div>
      <div>LoginPage</div>
      <div>
        <Link href="/register">Register</Link>
      </div>
    </div>
  );
}
