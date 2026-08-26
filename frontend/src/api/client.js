import axios from 'axios';

// On utilise la variable d'environnement VITE_API_URL fournie par Vercel.
// Si elle n'existe pas (par exemple en local), on retombe sur localhost:3000.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Ajouter le token à chaque requête s'il existe dans le localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;