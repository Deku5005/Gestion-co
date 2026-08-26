import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const [form, setForm] = useState({ nom: '', email: '', mot_de_passe: '' });

    useEffect(() => {
        if (user) setForm({ nom: user.nom, email: user.email, mot_de_passe: '' });
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/auth/profile', form);
            alert('Profil mis à jour avec succès !');
            logout(); // On déconnecte pour forcer une reconnexion avec les nouvelles infos
        } catch (err) {
            alert('Erreur lors de la mise à jour');
        }
    };

    return (
        <div className="auth-container">
            <h2>Mon Profil</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Nom" value={form.nom} onChange={(e) => setForm({...form, nom: e.target.value})} required />
                <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
                <input type="password" placeholder="Nouveau mot de passe (laisser vide pour ne pas changer)" value={form.mot_de_passe} onChange={(e) => setForm({...form, mot_de_passe: e.target.value})} />
                <button type="submit">Mettre à jour</button>
            </form>
        </div>
    );
};

export default Profile;