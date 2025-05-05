import { HamburgerIcon } from "@chakra-ui/icons";
import { Flex, Heading, IconButton } from "@chakra-ui/react";

interface SideBarControlProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export default function SideBarControl({ isCollapsed, onToggleCollapse }: SideBarControlProps) {
    return (

        <Flex alignItems="center" justifyContent="space-between" mb="4">
            <Heading size="md" display={{ base: 'block', md: isCollapsed ? 'none' : 'block' }}>
                Menu
            </Heading>
            <IconButton
                aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
                icon={<HamburgerIcon boxSize="s" />}
                onClick={onToggleCollapse}
                variant="ghost"
                size="sm"
            />
        </Flex>
    )
}