import { Button } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/icons";
import { FaGoogle } from "react-icons/fa";

interface GoogleButtonProps {
    mode: string;
    handleGoogleSignIn: () => void;
    handleGoogleSignUp: () => void;
}

export default function GoogleButton({ mode, handleGoogleSignIn, handleGoogleSignUp }: GoogleButtonProps) {
    return (
        <Button
            onClick={mode === 'login' ? handleGoogleSignIn : handleGoogleSignUp}
            colorScheme="gray"
            leftIcon={<Icon as={FaGoogle} />}
            w="full"
            mb={4}
        >
            {mode === 'login' ? 'Login with Google' : 'Sign Up with Google'}
        </Button>
    )
}