import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
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