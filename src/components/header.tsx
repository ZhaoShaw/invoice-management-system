import { type User } from "next-auth";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { UserRole } from "~/types/index.d";

interface Props {
  isInAdmin?: boolean;
  user: User;
}

export function Header({ isInAdmin = false, user }: Props) {
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
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>{user.name}</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>{user.email}</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {user.role === UserRole.ADMIN && (
                <div>
                  <DropdownMenuItem asChild>
                    {isInAdmin ? (
                      <Link href="/dashboard">Switch to Normal User</Link>
                    ) : (
                      <Link href="/admin/dashboard">Switch to Admin</Link>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  {isInAdmin && (
                    <div>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/setting/user">Setting</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </div>
                  )}
                </div>
              )}

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
