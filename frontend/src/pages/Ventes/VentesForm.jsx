import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import './Ventes.css';

const VentesForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    // Nouveau champ pour le paiement supplémentaire
    const [nouveauPaiement, setNouveauPaiement] = useState(0);

    const [articles, setArticles] = useState([]);
    const [clients, setClients] = useState([]);
    const [form, setForm] = useState({ 
        article_id: '', 
        client_id: '', 
        quantite: 1, 
        prix_vente: 0, 
        montant_paye: 0, 
        mode_paiement: 'Espèces', 
        statut_livraison: 'En attente' 
    });

    // Calculs automatiques
    const totalCalcul = (parseFloat(form.prix_vente) || 0) * (parseInt(form.quantite) || 0);
    const ancienPaye = parseFloat(form.montant_paye) || 0;
    const nouveauPaye = ancienPaye + (parseFloat(nouveauPaiement) || 0);
    const resteCalcul = Math.max(0, totalCalcul - nouveauPaye);

    useEffect(() => {
        api.get('/articles').then(res => setArticles(res.data));
        api.get('/clients').then(res => setClients(res.data));

        // CHARGEMENT DES DONNÉES EXISTANTES POUR L'ÉDITION
        if (isEditing) {
            api.get('/ventes').then(res => {
                const vente = res.data.ventes.find(v => v.id == id);
                if (vente) {
                    setForm({ 
                        article_id: vente.article_id || '',
                        client_id: vente.client_id || '',
                        quantite: vente.quantite || 1,
                        prix_vente: vente.prix_vente || 0,
                        montant_paye: vente.montant_paye || 0,
                        mode_paiement: vente.mode_paiement || 'Espèces',
                        statut_livraison: vente.statut_livraison || 'En attente'
                    });
                }
            });
        }
    }, [id, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // On envoie le montant total payé (ancien + nouveau)
            const dataToSend = {
                ...form,
                montant_paye: nouveauPaye,
                client_id: form.client_id === '' ? null : form.client_id,
                article_id: form.article_id ? parseInt(form.article_id) : null,
                quantite: parseInt(form.quantite) || 1,
                prix_vente: parseFloat(form.prix_vente) || 0,
            };

            if (isEditing) {
                await api.put(`/ventes/${id}`, dataToSend);
                alert('Vente modifiée avec succès !');
            } else {
                await api.post('/ventes', dataToSend);
                alert('Vente enregistrée !');
            }
            
            // Retour à la liste (qui se mettra à jour automatiquement)
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

                <div className="total-calc-box">
                    <p>Total de la commande : <strong>{totalCalcul.toLocaleString()} FCFA</strong></p>
                </div>

                {/* AFFICHAGE DU DÉJÀ PAYÉ (Si modification) */}
                {isEditing && (
                    <div className="info-paye-box">
                        <p>Déjà payé : <strong>{ancienPaye.toLocaleString()} FCFA</strong></p>
                    </div>
                )}

                {/* CHAMP POUR PAYER ENCORE */}
                <label>Payer maintenant (FCFA)</label>
                <input 
                    type="number" 
                    value={nouveauPaiement} 
                    onChange={(e) => setNouveauPaiement(e.target.value)} 
                    placeholder="Ex: 2500"
                />

                <div className="reste-calc-box">
                    <p>Total payé : <strong>{nouveauPaye.toLocaleString()} FCFA</strong></p>
                    <p>Reste à payer : <strong>{resteCalcul.toLocaleString()} FCFA</strong></p>
                </div>

                <label>Mode de Paiement</label>
                <select value={form.mode_paiement} onChange={(e) => setForm({ ...form, mode_paiement: e.target.value })}>
                    <option>Espèces</option>
                    <option>Mobile Money</option>
                    <option>Crédit</option>
                </select>

                <button type="submit">{isEditing ? "Mettre à jour la Vente" : "Valider la Vente"}</button>
            </form>
        </div>
    );
};

export default VentesForm;