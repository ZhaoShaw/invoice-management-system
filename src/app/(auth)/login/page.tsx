"use client";
import { useEffect } from "react";
import AuthFormCard from "~/components/auth-form-card";
import { AuthStage } from "~/types/index.d";
export default function LoginPage() {
  useEffect(() => {
    async function deleteCookies() {
      await fetch("/api/cookies", {
        method: "get",
      });
    }
    deleteCookies().catch(console.error);
  }, []);
  return (
    <div className="grid h-full grid-cols-12 grid-rows-3">
      <AuthFormCard authStage={AuthStage.LOGIN} />
    </div>
  );
}
