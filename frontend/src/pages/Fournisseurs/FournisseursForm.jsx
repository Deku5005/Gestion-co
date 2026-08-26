import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import './Fournisseurs.css';

const FournisseursForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [form, setForm] = useState({ nom: '', historique_approvisionnement: '' });

    useEffect(() => {
        if (isEditing) {
            api.get(`/fournisseurs/${id}`).then(res => setForm(res.data));
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await api.put(`/fournisseurs/${id}`, form);
        } else {
            await api.post('/fournisseurs', form);
        }
        navigate('/fournisseurs');
    };

    return (
        <div>
            <h1>{isEditing ? "Modifier le fournisseur" : "Ajouter un fournisseur"}</h1>
            <Link to="/fournisseurs" className="action-btn" style={{ background: '#64748b' }}>← Retour à la liste</Link>

            <form onSubmit={handleSubmit} className="form-container">
                <input type="text" placeholder="Nom du fournisseur" value={form.nom} onChange={(e) => setForm({...form, nom: e.target.value})} required />
                <textarea placeholder="Historique d'approvisionnement" rows="3" value={form.historique_approvisionnement} onChange={(e) => setForm({...form, historique_approvisionnement: e.target.value})}></textarea>
                <button type="submit">{isEditing ? "Enregistrer" : "Ajouter"}</button>
            </form>
        </div>
    );
};
export default FournisseursForm;