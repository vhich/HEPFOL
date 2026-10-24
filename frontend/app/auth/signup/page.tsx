"use client";

import { AlertDemo } from "@/components/AlertDemo";
import { inlineLink } from "@/components/CheckBoxDescription";
import { FieldDescription } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { AuthErrorResponseType, SignupErrorTypes } from "@/lib/auth_types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { MailCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { ChangeEvent, useState } from "react";
import AuthPage, {
  authMainStyle,
  authSectionStyle,
  bgImagestyle,
} from "../AuthPage";
import { SignUpForm } from "./SignUpForm";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>();

  const supabase = getSupabaseBrowserClient();

  const [inputError, setInputError] = useState<SignupErrorTypes>({
    email: "",
    password:
      "Must contain atleast one uppercase, lowercase, digit, symbol and minimum of 8 characters",
  });

  const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const password_regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-])[A-Za-z\d@$!%*?&_\-]{8,}$/;

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    const validate_email = email_regex.test(e.target.value);
    if (!validate_email || !e.target.value) {
      return setInputError((prev) => ({
        ...prev,
        email: "Provide a valid email address",
      }));
    }
    return setInputError((prev) => ({
      ...prev,
      email: "",
    }));
  };
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const validate_password = password_regex.test(e.target.value);
    setPassword(e.target.value);
    if (!validate_password || !e.target.value) {
      return setInputError((prev) => ({
        ...prev,
        password:
          "Must contain atleast one uppercase, lowercase, digit, symbol and minimum of 8 characters",
      }));
    }
    return setInputError((prev) => ({
      ...prev,
      password: "",
    }));
  };

  const handleEmailSignUp = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSigningUp(true);
    try {
      if (!email || !password) return;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/signin`,
        },
      });
      if (error as AuthErrorResponseType)
        toast.add({
          type: "error",
          description: error?.message,
        });
      else setIsSubmitted(true);
    } catch (error) {
      toast.add({
        type: "error",
        description: error as string,
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <>
      {isSubmitted ? (
        <main className={authMainStyle}>
          <div className={bgImagestyle}></div>
          <section className={authSectionStyle}>
            <Link href={"/"} className="block">
              <Image
                src="/app_logo_icon_dark.svg"
                height={60}
                width={60}
                alt="Hepfol logo icon"
                className={"mx-auto"}
                priority
              />
            </Link>
            <AlertDemo
              alertIcon={<MailCheck />}
              alertTitle="Confirm email address"
              alertDescription="If an account with this email doesn't exists, a confirmation email has been sent. Please check your inbox to confirm email address or proceed to sign in instead."
            />
            <FieldDescription className="text-center">
              Already registered an account?{" "}
              <Link href={"/auth/signin"} className={inlineLink}>
                Sign in
              </Link>
            </FieldDescription>

            <FieldDescription className="text-center">
              By signing up to create an account, you agree to the{" "}
              <Link href={"/"} className={inlineLink}>
                Terms of Use and Privacy Policy
              </Link>
            </FieldDescription>
          </section>
        </main>
      ) : (
        <AuthPage isLoading={isSigningUp}>
          <form
            onSubmit={(e: React.SubmitEvent) => handleEmailSignUp(e)}
            role="form"
            className="w-full space-y-6"
          >
            <SignUpForm
              handleEmailChange={handleEmailChange}
              handlePasswordChange={handlePasswordChange}
              email={email}
              password={password}
              isSigningUp={isSigningUp}
              error={inputError}
            />
          </form>
        </AuthPage>
      )}
    </>
  );
}
