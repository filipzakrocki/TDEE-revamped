import { useEffect } from 'react';
import { useAuth } from '../../stores/auth/authStore';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        signOut().then(() => navigate('/'));
    }, [signOut, navigate]);

    return null;
};

export default Logout;