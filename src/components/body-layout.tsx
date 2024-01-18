"use client";

import * as React from "react";
import { type User } from "next-auth";
import { Header } from "~/components/header";

interface Props {
  isInAdmin?: boolean;
  user: User;
  children: React.ReactNode;
}

const BodyLayout = ({ isInAdmin = false, user, children }: Props) => {
  return (
    <div className="relative">
      <Header isInAdmin={isInAdmin} user={user} />
      <main className="absolute mt-24 flex w-full flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default BodyLayout;
