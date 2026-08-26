import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Register = () => {
    const [formData, setFormData] = useState({ nom: '', email: '', mot_de_passe: '', role: 'Vendeur' });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la création du compte");
        }
    };

    return (
        <div className="auth-container">
            <h2>Créer un compte</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Nom complet" name="nom" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
                <input type="email" placeholder="Email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                <input type="password" placeholder="Mot de passe" name="mot_de_passe" value={formData.mot_de_passe} onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})} required />
                <select name="role" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="Vendeur">Vendeur</option>
                    <option value="Stock">Gestionnaire de Stock</option>
                    <option value="Admin">Admin</option>
                </select>
                <button type="submit">S'inscrire</button>
            </form>
            <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
        </div>
    );
};

export default Register;