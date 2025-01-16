import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../stores/auth/authSlice';

import { AppDispatch } from '../app/store';

const Logout = () => {
const dispatch = useDispatch<AppDispatch>();
const navigate = useNavigate();

  useEffect(() => {
    dispatch(signOut())
    .then(() => navigate('/'));
  }, [dispatch, navigate]);

  return null;
};

export default Logout;