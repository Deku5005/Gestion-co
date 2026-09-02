import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import './Ventes.css';

const VentesForm = () => {
    const { id } = useParams(); // Pour la modification
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [articles, setArticles] = useState([]);
    const [clients, setClients] = useState([]);
    const [form, setForm] = useState({ article_id: '', client_id: '', quantite: 1, prix_vente: 0, montant_paye: 0, mode_paiement: 'Espèces', statut_livraison: 'En attente' });

    // Calcul automatique du TOTAL et du RESTE
    const totalCalcul = (parseFloat(form.prix_vente) || 0) * (parseInt(form.quantite) || 0);
    const resteCalcul = Math.max(0, totalCalcul - (parseFloat(form.montant_paye) || 0));

    useEffect(() => {
        api.get('/articles').then(res => setArticles(res.data));
        api.get('/clients').then(res => setClients(res.data));
        if (isEditing) {
            api.get(`/ventes`).then(res => {
                const vente = res.data.ventes.find(v => v.id == id);
                if (vente) setForm({ ...vente });
            });
        }
    }, [id, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/ventes/${id}`, form);
                alert('Vente modifiée !');
            } else {
                await api.post('/ventes', form);
                alert('Vente enregistrée !');
            }
            navigate('/ventes');
        } catch (err) {
            alert('Erreur : ' + err.response?.data);
        }
    };

    return (
        <div>
            <h1>{isEditing ? "Modifier la Vente" : "Point de Vente"}</h1>
            <Link to="/ventes" className="action-btn" style={{ background: '#64748b' }}>← Retour à l'historique</Link>

            <form onSubmit={handleSubmit} className="form-container">
                <label>Article</label>
                <select value={form.article_id} onChange={(e) => {
                    const art = articles.find(a => a.id == e.target.value);
                    setForm({ ...form, article_id: e.target.value, prix_vente: art ? art.prix_vente : 0 });
                }} required>
                    <option value="">Choisir un article</option>
                    {articles.map(a => <option key={a.id} value={a.id}>{a.designation} (Stock: {a.quantite_disponible})</option>)}
                </select>

                <label>Client (Optionnel)</label>
                <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                    <option value="">Client de passage (Aucun)</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>

                <label>Quantité</label>
                <input type="number" min="1" value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} required />

                <label>Prix Unitaire (FCFA)</label>
                <input type="number" value={form.prix_vente} onChange={(e) => setForm({ ...form, prix_vente: e.target.value })} required />

                {/* CALCUL AUTOMATIQUE */}
                <div className="total-calc-box">
                    <p>Total à payer : <strong>{totalCalcul.toLocaleString()} FCFA</strong></p>
                </div>

                <label>Montant Payé (FCFA)</label>
                <input type="number" value={form.montant_paye} onChange={(e) => setForm({ ...form, montant_paye: e.target.value })} />

                {/* RESTE A PAYER */}
                <div className="reste-calc-box">
                    <p>Reste à payer : <strong>{resteCalcul.toLocaleString()} FCFA</strong></p>
                </div>

                <label>Mode de Paiement</label>
                <select value={form.mode_paiement} onChange={(e) => setForm({ ...form, mode_paiement: e.target.value })}>
                    <option>Espèces</option>
                    <option>Mobile Money</option>
                    <option>Crédit</option>
                </select>

                <button type="submit">{isEditing ? "Modifier la Vente" : "Valider la Vente"}</button>
            </form>
        </div>
    );
};

export default VentesForm;