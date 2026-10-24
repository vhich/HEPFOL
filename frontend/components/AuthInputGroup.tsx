import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SignupInputTypes } from "@/lib/auth_types";
import { Eye, EyeClosed } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const AuthInputGroupDemo = ({ input }: { input: SignupInputTypes }) => {
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
