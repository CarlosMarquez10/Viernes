import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

function RequireAuth() {
  const isAuth = authService.isAuthenticated();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default RequireAuth;