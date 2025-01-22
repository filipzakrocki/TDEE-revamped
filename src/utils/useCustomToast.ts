import { useToast } from '@chakra-ui/react';

interface ToastConfig {
    title?: string;
    description: string;
    status?: "info" | "warning" | "success" | "error";
    duration?: number;
    isClosable?: boolean;
    position?: "top" | "top-right" | "top-left" | "bottom" | "bottom-right" | "bottom-left";
}

export function useCustomToast() {
    const toast = useToast();

    const showToast = (config: ToastConfig) => {
        const { title = '', description, status = 'info', duration = 3000, isClosable = true, position = 'bottom-right' } = config;
        toast({
            title,
            description,
            status,
            duration,
            isClosable,
            position
        });
    };

    return showToast;
}