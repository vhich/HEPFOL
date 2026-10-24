import { inlineLink } from "@/components/CheckBoxDescription";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { GoogleIcon } from "@/components/ui/GoogleIconSVG";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SignupInputTypes } from "@/lib/auth_types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Eye, EyeClosed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

const AuthPage = ({
  children,
  isLoading,
}: {
  children: ReactNode;
  isLoading: boolean;
}) => {
  const supabase = getSupabaseBrowserClient();
  const pathname = usePathname();
  const signInPath = pathname.startsWith("/auth/signin");
  const signUpPath = pathname.startsWith("/auth/signup");

  const handleGoogleLogin = async () => {
    const origin = window.location.origin; // Automatically detects http://localhost:3000 or https://hepfol-frontend.onrender.com

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };
  return (
    <main className={`${authMainStyle} ${isLoading && "pointer-events-none"}`}>
      <div className={bgImagestyle}></div>
      <section className={authSectionStyle}>
        <header className="mb-7 text-center">
          <Link href={"/"} className="block mb-4">
            <Image
              src="/app_logo_icon_dark.svg"
              height={50}
              width={50}
              alt="Hepfol logo icon"
              className={"mx-auto"}
              priority
            />
          </Link>
          <h5 className="text-3xl tracking-wider mb-1.5">
            {signInPath ? "Sign in to hepfol" : "Create account"}
          </h5>
          <FieldDescription className="text-sm text-center">
            {signUpPath
              ? "Sign up on hepfol and get started with your free 3 credits"
              : "Sign in to repurpose, schedule and post amazing content"}
          </FieldDescription>
        </header>

        <Button
          type="button"
          size={"lg"}
          onClick={() => handleGoogleLogin()}
          disabled={isLoading}
          className={
            "w-full py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
          }
        >
          <GoogleIcon /> Continue with Google
        </Button>
        <div className="relative flex items-center">
          <div className="grow border-t border-border"></div>
          <span className="shrink mx-4 text-gray-400 text-sm">or</span>
          <div className="grow border-t border-border"></div>
        </div>
        {children}
        <FieldDescription className="text-center">
          {signUpPath
            ? "Already registered an account?"
            : "Don't have an account yet?"}{" "}
          <Link
            href={signInPath ? "/auth/signup" : "/auth/signin"}
            className={inlineLink}
          >
            {signUpPath ? "Sign in" : "Sign up"}
          </Link>
        </FieldDescription>
        <br />
        <FieldDescription className="text-center">
          {signInPath
            ? "By signing in to your account, you agree to hepfol's"
            : "By signing up to create an account, you agree to hepfol's"}{" "}
          <Link href={"/"} className={inlineLink}>
            Terms of Use and Privacy Policy
          </Link>
        </FieldDescription>
      </section>
    </main>
  );
};

export default AuthPage;
export const InputGroupDemo = ({ input }: { input: SignupInputTypes }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const pathname = usePathname();
  const signUpPath = pathname.startsWith("/auth/signup");
  return (
    <InputGroup>
      <InputGroupInput
        id={input.id}
        type={input.id === "password" && showPassword ? "text" : input.type}
        value={input.value}
        onChange={input.onchange}
        aria-invalid={
          signUpPath &&
          input.value.length > 0 &&
          input.error_mssg !== "" &&
          true //i checked the lenght for the password field, the password error has a default error message in the signupPage
        }
      />
      <InputGroupAddon align="inline-end">
        {input.type === "password" && (
          <>
            {showPassword ? (
              <InputGroupButton
                aria-label="Show Password"
                title="Show password"
                size="icon-xs"
                onClick={() => {
                  setShowPassword(false);
                }}
              >
                <EyeClosed />
              </InputGroupButton>
            ) : (
              <InputGroupButton
                aria-label="hide Password"
                title="Hide password"
                size="icon-xs"
                onClick={() => {
                  setShowPassword(true);
                }}
              >
                <Eye />
              </InputGroupButton>
            )}
          </>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
};

export const authMainStyle = "flex min-h-screen items-center justify-center";
export const authSectionStyle =
  "w-full max-w-md p-8 space-y-6 rounded-xl shadow-md z-50";
export const bgImagestyle =
  "bg-[url('/main_bg.svg')] bg-center bg-cover w-full h-full bg-fixed fixed top-0 left-0 opacity-20 dark:opacity-5 light:opacity-20";
