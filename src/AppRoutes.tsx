import { Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import Calculator from './components/Calculator';

const AppRoutes = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/calculator" element={<Calculator/>} />
      <Route path="/faq" element={<div>Faq</div>} />
    </Routes>
  );
};

export default AppRoutes;