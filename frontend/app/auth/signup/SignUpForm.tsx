import { AuthInputGroupDemo } from "@/components/AuthInputGroup";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { SignUpFormType, SignupInputTypes } from "@/lib/auth_types";
import { cn } from "cn";
import { LoaderCircle } from "lucide-react";
import { ChangeEvent } from "react";

export function SignUpForm({
  email,
  password,
  error,
  handleEmailChange,
  handlePasswordChange,
  isSigningUp,
}: SignUpFormType) {
  const signupFieldInputs: SignupInputTypes[] = [
    {
      type: "email",
      id: "email",
      label: "email",
      value: email,
      error_mssg: error.email,
      onchange: (e: ChangeEvent<HTMLInputElement>) => handleEmailChange(e),
    },
    {
      type: "password",
      id: "password",
      label: "password",
      value: password,
      error_mssg: error.password,
      onchange: (e: ChangeEvent<HTMLInputElement>) => handlePasswordChange(e),
    },
  ];

  return (
    <FieldGroup className="w-full">
      <FieldSet>
        {signupFieldInputs.map((input) => (
          <Field key={input.id} data-invalid={input.error_mssg}>
            <FieldLabel htmlFor={input.id} className="capitalize">
              {input.label}
            </FieldLabel>
            <AuthInputGroupDemo input={input} />
            <FieldDescription className="text-xs">
              {input.error_mssg !== "" && input.error_mssg}
            </FieldDescription>
          </Field>
        ))}

        <Button
          size={"lg"}
          type="submit"
          className={cn("mt-2")}
          disabled={error.email !== "" || error.password !== "" || isSigningUp}
        >
          {isSigningUp && <LoaderCircle className="animate-spin" />}
          Sign up
        </Button>
      </FieldSet>
    </FieldGroup>
  );
}
