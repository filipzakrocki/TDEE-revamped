import { useEffect } from 'react';
import { useAuthStore } from '../../stores/auth/authStore';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const signOut = useAuthStore(state => state.signOut);
    const navigate = useNavigate();

    useEffect(() => {
        signOut().then(() => navigate('/'));
    }, [signOut, navigate]);

    return null;
};

export default Logout;