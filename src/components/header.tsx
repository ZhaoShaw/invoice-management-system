import { type User } from "next-auth";

interface Props {
  user: User;
}

export function Header({ user }: Props) {
  return (
    <header className="fixed right-0 top-0 z-50 w-full">
      <div className="flex h-24 gap-2 bg-blue-400">Header</div>
    </header>
  );
}
