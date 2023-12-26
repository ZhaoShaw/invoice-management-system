"use client";

import * as React from "react";
import { type User } from "next-auth";
import { Header } from "~/components/header";
import Icon from "~/components/icon";
import { Button } from "~/components/ui/button";

interface Props {
  user: User;
  children: React.ReactNode;
}

export function BodyLayout({ user, children }: Props) {
  return (
    <div className="relative">
      <Header user={user} />
      <main className="absolute mt-24 flex w-full flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
