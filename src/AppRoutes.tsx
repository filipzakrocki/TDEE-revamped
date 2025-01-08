import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Auth from './views/Auth';
import Calculator from './views/Calculator';
import Header from './components/Header';
import Footer from './components/Footer';
import MainFrame from './components/MainFrame';

const PrivateRoute = ({ element }: { element: JSX.Element }): JSX.Element => {
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" />;

  return (
    <>
      <Header />
        <MainFrame>
          {element}
        </MainFrame>
      <Footer />
    </>
  );

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