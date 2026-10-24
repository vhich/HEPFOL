import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SignUpFormType, SignupInputTypes } from "@/lib/auth_types";
import { cn } from "cn";
import { Eye, EyeClosed, LoaderCircle } from "lucide-react";
import { ChangeEvent, useState } from "react";

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
          <Field key={input.id} data-inavlid={input.error_mssg}>
            <FieldLabel htmlFor={input.id} className="capitalize">
              {input.label}
            </FieldLabel>
            <InputGroupDemo input={input} />
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

export const InputGroupDemo = ({ input }: { input: SignupInputTypes }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  return (
    <InputGroup>
      <InputGroupInput
        id={input.id}
        type={input.id === "password" && showPassword ? "text" : input.type}
        value={input.value}
        onChange={input.onchange}
        aria-invalid={
          input.value.length > 0 && input.error_mssg !== "" && true //i checked the lenght for the password field, the password error has a default error message in the signupPage
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
