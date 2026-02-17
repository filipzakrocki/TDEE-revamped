import { createStandaloneToast } from '@chakra-ui/react';

const { toast } = createStandaloneToast();

interface ToastOptions {
    title?: string;
    description: string;
    status?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    isClosable?: boolean;
    position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left';
}

const defaultOptions = {
    duration: 3000,
    isClosable: true,
    position: 'bottom-right' as const
};

export const showToast = (options: ToastOptions) => {
    toast({
        ...defaultOptions,
        ...options
    });
};

export const showSuccessToast = (description: string, title = 'Success') => {
    showToast({
        title,
        description,
        status: 'success'
    });
};

export const showErrorToast = (description: string, title = 'Error') => {
    showToast({
        title,
        description,
        status: 'error',
        duration: 5000
    });
}; 