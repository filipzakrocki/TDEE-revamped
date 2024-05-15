import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { User } from 'firebase/auth';
import { signIn, signOut, register } from '../features/auth/authSlice';
import { Input, Button, Box, FormControl, FormLabel } from '@chakra-ui/react';

function Auth() {
    const dispatch = useDispatch<AppDispatch>();
    const user: User | null = useSelector((state: RootState) => state.auth.user);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSignIn = () => {
        dispatch(signIn({ email, password }));
    };

    const handleRegister = () => {
        if (password === confirmPassword) {
            dispatch(register({ email, password }));
        } else {
            // Handle password mismatch error
            console.log('Passwords do not match');
        }
    };

    const handleSignOut = () => {
        dispatch(signOut());
    };

    const toggleForm = () => {
        setIsRegistering(!isRegistering);
    };

    if (user) {
        return (
            <Box>
                Signed in as {user?.email}
                <Button onClick={handleSignOut}>Sign out</Button>
            </Box>
        );
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <Box width="300px">
                <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                </FormControl>
                <FormControl mt={4}>
                    <FormLabel>Password</FormLabel>
                    <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        type="password"
                    />
                </FormControl>
                {isRegistering && (
                    <FormControl mt={4}>
                        <FormLabel>Confirm Password</FormLabel>
                        <Input
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            type="password"
                        />
                    </FormControl>
                )}
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                    <Button colorScheme='teal' variant='outline' mt={4} onClick={toggleForm}>
                        {isRegistering ? 'Sign In' : 'Sign up'}
                    </Button>
                    <Button colorScheme='teal' variant='outline' mt={4} onClick={isRegistering ? handleRegister : handleSignIn}>
                        {isRegistering ? 'Sign Up' : 'Sign In'}
                    </Button>
                </Box>

            </Box>
        </Box>
    );
}

export default Auth;