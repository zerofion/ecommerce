import { Button } from "@chakra-ui/react";
import { FaUser } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa";

interface FormSubmissionButtonProps {
    mode: string;
    isLoading: boolean;
    isDisabled: boolean;
}

export default function FormSubmissionButton({ mode, isLoading, isDisabled }: FormSubmissionButtonProps) {
    return (
        <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            leftIcon={mode === 'login' ? <FaUser /> : <FaUserPlus />}
            w="full"
            mb={4}
            isDisabled={isDisabled}
        >
            {mode === 'login' ? 'Login' : 'Sign Up'}
        </Button>
    )
}