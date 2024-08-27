import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Auth from './components/Auth';
import Calculator from './components/Calculator';

const PrivateRoute = ({ element }: { element: JSX.Element }): JSX.Element => {
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  return isAuthenticated ? element : <Navigate to="/" />;
};

const AppRoutes = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/calculator" element={<PrivateRoute element={<Calculator />} />} />
      <Route path="/faq" element={<PrivateRoute element={<div>Faq</div>} />} />
    </Routes>
  );
};

export default AppRoutes;