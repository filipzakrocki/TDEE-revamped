import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// useDispatch and useSelector are used to interact with the Redux store
import { useSelector, useDispatch } from 'react-redux';
// AppDispatch and RootState are used to type the useDispatch and useSelector hooks
import { AppDispatch, RootState } from '../app/store';
import { User } from 'firebase/auth';
import { signIn, register } from '../stores/auth/authSlice';
import { InterfaceState } from "../stores/interface/interfaceSlice";
import { Input, Button, Box, FormControl, FormLabel, Image } from '@chakra-ui/react';
import { useCustomToast } from '../utils/useCustomToast';
import { config } from '../config';


function Auth() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const showToast = useCustomToast();

    const user: User | null = useSelector((state: RootState) => state.auth.user);
    const { loading }: InterfaceState = useSelector((state: RootState) => state.interface);

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
            showToast({
                title: 'Error',
                description: 'Passwords do not match',
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
            
        }
    };

    const toggleForm = () => {
        setIsRegistering(!isRegistering);
    };

    useEffect(() => {
        if (user) navigate(config.startingPoint);
    }, [user, navigate]);
    
    return (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection='column' height="100vh" className='animated-bg'>
            <Box width='400px' background={'white'} p={4}>
                <Image src={require('../assets/tdeefitteal.png')} mb={10}/>
            </Box>
            <Box width="400px" background={'white'} p={4}>
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
                        {isRegistering ? 'Sign Up' : loading ? 'Loading...' : 'Sign In'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default Auth;