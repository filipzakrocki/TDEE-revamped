import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { User } from 'firebase/auth';
import { signIn,
    //  signOut, 
     register } from '../features/auth/authSlice';
import { Input, Button, Box, FormControl, FormLabel, Image } from '@chakra-ui/react';

function Auth() {
    const navigate = useNavigate();
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

    // const handleSignOut = () => {
    //     dispatch(signOut());
    // };

    const toggleForm = () => {
        setIsRegistering(!isRegistering);
    };

    useEffect(() => {
        if (user) navigate('/calculator');
    }, [user, navigate]);


    return (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection='column' height="100vh">
            <Box width='400px'>
                <Image src={require('../assets/tdeefitteal.png')} mb={10}/>
            </Box>
            <Box width="400px">
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
                    <Button colorScheme='teal' variant='link' mt={4} onClick={toggleForm}>
                        {isRegistering ? 'Switch to sign in' : 'Switch to sign up'}
                    </Button>
                    <Button colorScheme='teal' variant='solid' mt={4} onClick={isRegistering ? handleRegister : handleSignIn}>
                        {isRegistering ? 'Sign Up' : 'Sign In'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default Auth;