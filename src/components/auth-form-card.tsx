import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { AuthStage } from "~/types/index.d";
import AuthForm from "~/components/auth-form";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { link } from "fs";

type CardProps = React.ComponentProps<typeof Card> & {
  authStage: AuthStage;
};

const AuthFormCard = ({ className, ...props }: CardProps) => {
  return (
    <Card
      className={cn(
        "col-start-4 col-end-10 row-start-2 row-end-3 bg-white",
        className,
      )}
      {...props}
    >
      <CardHeader>
        <CardTitle>
          {props.authStage === AuthStage.LOGIN ? "Login" : "Register"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AuthForm authStage={props.authStage} />
      </CardContent>
      <CardFooter>
        <Button className="m-0 p-0 text-gray-500" variant={"link"} asChild>
          {props.authStage === AuthStage.LOGIN ? (
            <Link href="/register">Register</Link>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthFormCard;
