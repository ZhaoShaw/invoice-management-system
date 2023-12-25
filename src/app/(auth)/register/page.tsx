import * as React from "react";
import AuthFormCard from "~/components/auth-form-card";
import { AuthStage } from "~/types/index.d";
export default function RegisterPage() {
  return (
    <div className="grid h-full grid-cols-12 grid-rows-3">
      <AuthFormCard authStage={AuthStage.REGISTER} />
    </div>
  );
}
