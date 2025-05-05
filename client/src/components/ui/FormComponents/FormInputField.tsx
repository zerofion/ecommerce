import { FormControl, FormLabel, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";

interface FormFieldProps {
    formFieldLabel: string;
    formFieldValue: string;
    handleFormFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    formFieldPlaceholder: string;
    formFieldType: string;
    formFieldIcon: React.ReactNode;
    formFieldIsRequired: boolean;
    optionalChildren?: React.ReactNode;
}

export default function FormInputField({ formFieldLabel, formFieldValue,
    handleFormFieldChange, formFieldPlaceholder,
    formFieldType, formFieldIcon,
    formFieldIsRequired, optionalChildren }: FormFieldProps) {
    return (
        <FormControl isRequired={formFieldIsRequired}>
            <FormLabel>{formFieldLabel}</FormLabel>
            <InputGroup>
                <InputLeftElement pointerEvents="none">
                    {formFieldIcon}
                </InputLeftElement>
                <Input
                    type={formFieldType}
                    value={formFieldValue}
                    onChange={handleFormFieldChange}
                    placeholder={formFieldPlaceholder}
                />
            </InputGroup>
            {optionalChildren}
        </FormControl>
    )
}