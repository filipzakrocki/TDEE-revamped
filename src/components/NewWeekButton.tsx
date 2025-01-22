import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../app/store';
import {
    Button,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure
} from '@chakra-ui/react';
import { addNewWeek } from '../stores/calc/calcSlice';

const NewWeekButton: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    const dispatch = useDispatch<AppDispatch>();


    const handleNewWeek = () => {
        dispatch(addNewWeek());
        onClose();
    };

    return (
        <>
            <Button colorScheme="teal" onClick={onOpen}>
                Start New Week
            </Button>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Start New Week
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to start a new week? This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleNewWeek} ml={3}>
                                Start
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

export default NewWeekButton;