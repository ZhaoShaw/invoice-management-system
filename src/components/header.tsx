import { type User } from "next-auth";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface Props {
  user: User;
}

export function Header({ user }: Props) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };
  return (
    <header className="fixed right-0 top-0 z-50 w-full">
      <div className="flex h-24 flex-row items-center justify-between bg-blue-400 pl-4 pr-8">
        <div className="relative h-16 w-36">
          <Link href="/">
            <Image src="/site-pic.png" alt="site picture" fill />
          </Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage src="/user.png" alt="@shadcn" />
              <AvatarFallback>PIC</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={handleSignOut}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
