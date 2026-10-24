import { ChangeEvent } from "react";

export interface SignupErrorTypes {
  email: string;
  password: string;
}

type SignupId = "email" | "password" | "text";

export interface SignupInputTypes {
  type: SignupId;
  id: SignupId;
  label: SignupId;
  value: string;
  error_mssg: string | null;
  onchange: (e: ChangeEvent<HTMLInputElement>) => void;
}
export interface SignUpFormType {
  email: string;
  password: string;
  error: SignupErrorTypes;
  isSigningUp: boolean;
  handleEmailChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface AuthErrorResponseType {
  code: string | null;
  message: string | null;
}
