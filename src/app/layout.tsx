import "~/styles/globals.css";

import { cookies } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/toaster";
import { UserRoleSwitch } from "~/components/user-role-switch";

export const metadata = {
  title: "Santa",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider cookies={cookies().toString()}>
          <UserRoleSwitch />
          {children}
        </TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
