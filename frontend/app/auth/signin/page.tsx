"use client";
import { AuthInputGroupDemo } from "@/components/AuthInputGroup";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { SignupInputTypes } from "@/lib/auth_types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "cn";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import AuthPage from "../AuthPage";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const handleEmailLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSigningIn(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.add({
        type: "error",
        description: error?.message,
      }); // e.g., "Invalid login credentials"
    } else {
      toast.add({
        type: "success",
        description: "Logged in successfully!",
      });
      // Redirect user to your dashboard
      router.push("/dashboard");
    }

    setIsSigningIn(false);
  };
  const signInFieldInputs: SignupInputTypes[] = [
    {
      type: "email",
      id: "email",
      label: "email",
      value: email,
      error_mssg: null,
      onchange: (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    },
    {
      type: "password",
      id: "password",
      label: "password",
      value: password,
      error_mssg: null,
      onchange: (e: ChangeEvent<HTMLInputElement>) =>
        setPassword(e.target.value),
    },
  ];
  return (
    <AuthPage isLoading={isSigningIn}>
      <form onSubmit={(e: React.SubmitEvent) => handleEmailLogin(e)}>
        <FieldGroup className="w-full">
          <FieldSet>
            {signInFieldInputs.map((input) => (
              <Field key={input.id}>
                <FieldLabel htmlFor={input.id} className="capitalize">
                  {input.label}
                </FieldLabel>
                <AuthInputGroupDemo input={input} />
                <FieldDescription key={input.id}>
                  {input.error_mssg !== "" && input.error_mssg}
                </FieldDescription>
              </Field>
            ))}

            <Button
              size={"lg"}
              type="submit"
              className={cn("mt-4")}
              disabled={isSigningIn || !email || !password}
            >
              {isSigningIn && <LoaderCircle className="animate-spin" />}
              Sign in
            </Button>
          </FieldSet>
        </FieldGroup>
      </form>
    </AuthPage>
  );
};

export default LoginPage;
