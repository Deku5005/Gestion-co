import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Vérifier si un utilisateur est déjà connecté au chargement de la page
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/auth/me')
                .then(res => setUser(res.data))
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // Fonction de connexion
    const login = async (email, mot_de_passe) => {
        const res = await api.post('/auth/login', { email, mot_de_passe });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.utilisateur);
    };

    // Fonction d'inscription
    const register = async (formData) => {
        await api.post('/auth/register', formData);
    };

    // Fonction de déconnexion
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);