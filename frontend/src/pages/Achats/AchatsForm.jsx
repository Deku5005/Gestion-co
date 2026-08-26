import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import './Achats.css';

const AchatsForm = () => {
    const navigate = useNavigate();
    const [fournisseurs, setFournisseurs] = useState([]);
    const [articles, setArticles] = useState([]);
    const [form, setForm] = useState({ fournisseur_id: '', article_id: '', quantite: 1, prix_achat: 0 });

    useEffect(() => {
        api.get('/fournisseurs').then(res => setFournisseurs(res.data));
        api.get('/articles').then(res => setArticles(res.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/achats', form);
            alert('Achat enregistré ! Le stock a été mis à jour.');
            navigate('/achats');
        } catch (err) {
            alert('Erreur lors de l\'achat : ' + err.response?.data);
        }
    };

    return (
        <div>
            <h1>Nouvel Achat / Approvisionnement</h1>
            <Link to="/achats" className="action-btn" style={{ background: '#64748b' }}>← Retour à l'historique</Link>

            <form onSubmit={handleSubmit} className="form-container">
                <label>Fournisseur</label>
                <select value={form.fournisseur_id} onChange={(e) => setForm({...form, fournisseur_id: e.target.value})} required>
                    <option value="">Choisir un fournisseur</option>
                    {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>

                <label>Article à approvisionner</label>
                <select value={form.article_id} onChange={(e) => {
                    const art = articles.find(a => a.id == e.target.value);
                    setForm({...form, article_id: e.target.value, prix_achat: art ? art.prix_achat : 0});
                }} required>
                    <option value="">Choisir un article</option>
                    {articles.map(a => <option key={a.id} value={a.id}>{a.designation} (Stock actuel : {a.quantite_disponible})</option>)}
                </select>

                <label>Quantité achetée</label>
                <input type="number" min="1" value={form.quantite} onChange={(e) => setForm({...form, quantite: e.target.value})} required />

                <label>Prix d'achat unitaire (FCFA)</label>
                <input type="number" step="0.01" value={form.prix_achat} onChange={(e) => setForm({...form, prix_achat: e.target.value})} required />

                <button type="submit">Enregistrer l'achat</button>
            </form>
        </div>
    );
};

export default AchatsForm;