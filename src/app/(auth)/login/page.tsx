import AuthFormCard from "~/components/auth-form-card";
import { AuthStage } from "~/types/index.d";
export default async function LoginPage() {
  return (
    <div className="grid h-full grid-cols-12 grid-rows-3">
      <AuthFormCard authStage={AuthStage.LOGIN} />
    </div>
  );
}
