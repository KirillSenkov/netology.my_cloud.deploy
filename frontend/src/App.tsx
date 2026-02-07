import { useEffect } from 'react';
import { useAppDispatch } from './app/hooks';
import { bootstrapAuth } from './features/auth/authSlice';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import FilesPage from './pages/FilesPage/FilesPage';
import AdminUsersPage from './pages/AdminUsersPage/AdminUsersPage';

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(bootstrapAuth());
  }, [dispatch]);
  
  return (
    <>
      <NavBar />

      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path='/' element={<FilesPage />} />
          <Route path='/admin/users' element={<AdminUsersPage />} />
        </Route>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </>
  );
}
