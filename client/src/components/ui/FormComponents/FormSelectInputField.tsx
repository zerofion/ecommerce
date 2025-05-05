import { FormControl, FormLabel, Select } from "@chakra-ui/react";
import { ReactElement } from "react";

interface FormSelectInputFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    icon?: ReactElement;
    options: Array<{ value: string; label: string }>;
    isRequired?: boolean;
}

export default function FormSelectInputField({ value, onChange, icon, options, isRequired }: FormSelectInputFieldProps) {
    return (
        <>
            <FormControl isRequired={isRequired}>
                <FormLabel>Role</FormLabel>
                <Select
                    value={value}
                    onChange={onChange}
                    icon={icon}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Select>
            </FormControl>
        </>
    )
}