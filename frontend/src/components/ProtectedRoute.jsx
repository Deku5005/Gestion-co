import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Chargement...</div>;

    if (!user) return <Navigate to="/login" />;

    // Vérification du rôle
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <div style={{ padding: '20px', color: 'red' }}>Accès refusé. Vous n'avez pas les droits pour voir cette page.</div>;
    }

    return children;
};

export default ProtectedRoute;