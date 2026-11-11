import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RadioGroupChoiceCard({
  value,
  selectedValue,
  setValue,
}: {
  value: string;
  selectedValue: string;
  setValue: (value: string) => void;
}) {
  return (
    <RadioGroup
      value={selectedValue}
      onValueChange={(val) => setValue(val)}
      className="max-w-sm"
    >
      <FieldLabel htmlFor={value}>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>{value}</FieldTitle>
          </FieldContent>
          <RadioGroupItem value={value} id={value} />
        </Field>
      </FieldLabel>
    </RadioGroup>
  );
}
