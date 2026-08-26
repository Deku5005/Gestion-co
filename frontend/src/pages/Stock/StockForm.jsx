import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import './Stock.css';

const StockForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [form, setForm] = useState({ designation: '', prix_achat: '', prix_vente: '', quantite_disponible: '', seuil_alerte: '', unite: '' });

    useEffect(() => {
        if (isEditing) {
            api.get(`/articles/${id}`).then(res => setForm(res.data));
        }
    }, [id, isEditing]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await api.put(`/articles/${id}`, form);
        } else {
            await api.post('/articles', form);
        }
        navigate('/stock');
    };

    return (
        <div>
            <h1>{isEditing ? "Modifier l'article" : "Ajouter un article"}</h1>
            <Link to="/stock" className="action-btn" style={{ background: '#64748b' }}>← Retour à la liste</Link>

            <form onSubmit={handleSubmit} className="form-container">
                <input type="text" name="designation" placeholder="Désignation" value={form.designation} onChange={handleChange} required />
                <input type="number" step="0.01" name="prix_achat" placeholder="Prix d'achat" value={form.prix_achat} onChange={handleChange} required />
                <input type="number" step="0.01" name="prix_vente" placeholder="Prix de vente" value={form.prix_vente} onChange={handleChange} required />
                <input type="number" name="quantite_disponible" placeholder="Quantité disponible" value={form.quantite_disponible} onChange={handleChange} required />
                <input type="number" name="seuil_alerte" placeholder="Seuil d'alerte" value={form.seuil_alerte} onChange={handleChange} required />
                <input type="text" name="unite" placeholder="Unité (ex: pcs)" value={form.unite} onChange={handleChange} />
                
                <button type="submit">{isEditing ? "Enregistrer les modifications" : "Ajouter l'article"}</button>
            </form>
        </div>
    );
};

export default StockForm;