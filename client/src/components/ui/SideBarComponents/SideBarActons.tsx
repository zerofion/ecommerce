import { useAuth } from "../../../hooks/useAuthHook";
import { Flex, Button, Box } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaHome, FaBoxes, FaShoppingCart } from "react-icons/fa";
import { ClientRole } from "../../../context/types";

interface SideBarActionsProps {
    onClose: () => void;
    isCollapsed: boolean;
}

export default function SideBarActions({ onClose, isCollapsed }: SideBarActionsProps) {
    const { authSession } = useAuth();

    const commonActions = () => {
        return (
            <>
                <Button
                    as={Link}
                    to="/"
                    variant="ghost"
                    onClick={onClose}
                    leftIcon={<FaHome />}
                    justifyContent="center"
                    w="full"
                    _hover={{
                        bg: 'primary.50',
                        color: 'primary.700',
                    }}
                    p={isCollapsed ? '0' : '4'}
                    m={0}
                    display="flex"
                >
                    <Box display={{ base: 'none', md: isCollapsed ? 'none' : 'block' }}>
                        Home
                    </Box>
                </Button>
                <Button
                    as={Link}
                    to="/orders"
                    variant="ghost"
                    onClick={onClose}
                    leftIcon={<FaShoppingCart />}
                    justifyContent="center"
                    w="full"
                    _hover={{
                        bg: 'primary.50',
                        color: 'primary.700',
                    }}
                    display="flex"
                >
                    <Box display={{ base: 'none', md: isCollapsed ? 'none' : 'block' }}>
                        Orders
                    </Box>
                </Button>
            </>
        )
    }

    function renderMenuItems() {
        switch (authSession!.user!.role) {
            case ClientRole.VENDOR:
                return (
                    <Flex direction="column" gap="3" h="calc(100% - 64px)" >
                        {commonActions()}
                        <Button
                            as={Link}
                            to="/products"
                            variant="ghost"
                            onClick={onClose}
                            leftIcon={<FaBoxes />}
                            justifyContent="center"
                            w="full"
                            _hover={{
                                bg: 'primary.50',
                                color: 'primary.700',
                            }}
                            display="flex"
                        >
                            <Box display={{ base: 'none', md: isCollapsed ? 'none' : 'block' }}>
                                Products
                            </Box>
                        </Button>

                    </Flex>
                );
            case ClientRole.CUSTOMER:
            case ClientRole.B2B_CUSTOMER:
                return (
                    <Flex direction="column" gap="3" h="calc(100% - 64px)">
                        {commonActions()}
                    </Flex>
                );
            default:
                return null;
        }
    }


    return (
        <Flex direction="column" gap="3" h="calc(100% - 64px)" >
            {renderMenuItems()}
        </Flex>
    )
}