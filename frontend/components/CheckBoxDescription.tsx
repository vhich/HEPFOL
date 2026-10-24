import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import Link from "next/link";

export function CheckboxDescription({ setDisable }: { setDisable: boolean }) {
  return (
    <FieldGroup className="mx-auto">
      <Field orientation="horizontal">
        <Checkbox
          id="terms-checkbox-desc"
          name="terms-checkbox-desc"
          disabled={setDisable}
        />
        <FieldContent>
          <FieldLabel htmlFor="terms-checkbox-desc">
            Accept terms and conditions
          </FieldLabel>
          <FieldDescription>
            By clicking the checkbox and sign up, you agree to the{" "}
            <Link href={"/"} className={inlineLink}>
              Terms of Use and Privacy Policy
            </Link>
          </FieldDescription>
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}

export const inlineLink = "no-underline text-purple-400";
