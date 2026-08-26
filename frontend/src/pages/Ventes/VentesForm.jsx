import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import './Ventes.css';

const VentesForm = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [clients, setClients] = useState([]);
    const [form, setForm] = useState({ article_id: '', client_id: '', quantite: 1, prix_vente: 0, mode_paiement: 'Espèces' });

    useEffect(() => {
        api.get('/articles').then(res => setArticles(res.data));
        api.get('/clients').then(res => setClients(res.data));
    }, []);

        const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // On transforme la chaîne vide en null pour la base de données
            const dataToSend = {
                ...form,
                client_id: form.client_id === '' ? null : form.client_id,
            };
            
            await api.post('/ventes', dataToSend);
            alert('Vente enregistrée avec succès !');
            navigate('/ventes');
        } catch (err) {
            alert('Erreur : ' + err.response?.data);
        }
    };

    return (
        <div>
            <h1>Point de Vente</h1>
            <Link to="/ventes" className="action-btn" style={{ background: '#64748b' }}>← Retour à l'historique</Link>

            <form onSubmit={handleSubmit} className="form-container">
                <select value={form.article_id} onChange={(e) => {
                    const art = articles.find(a => a.id == e.target.value);
                    setForm({...form, article_id: e.target.value, prix_vente: art ? art.prix_vente : 0});
                }} required>
                    <option value="">Choisir un article</option>
                    {articles.map(a => <option key={a.id} value={a.id}>{a.designation} ({a.quantite_disponible} en stock)</option>)}
                </select>
                <select value={form.client_id} onChange={(e) => setForm({...form, client_id: e.target.value})}>
                    <option value="">Client de passage (Aucun)</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
                <input type="number" placeholder="Quantité" value={form.quantite} onChange={(e) => setForm({...form, quantite: e.target.value})} required />
                <input type="number" placeholder="Prix de vente unitaire" value={form.prix_vente} onChange={(e) => setForm({...form, prix_vente: e.target.value})} required />
                <select value={form.mode_paiement} onChange={(e) => setForm({...form, mode_paiement: e.target.value})}>
                    <option>Espèces</option>
                    <option>Mobile Money</option>
                    <option>Crédit</option>
                </select>
                <button type="submit">Valider la vente</button>
            </form>
        </div>
    );
};
export default VentesForm;