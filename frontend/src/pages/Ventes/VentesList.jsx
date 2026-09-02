import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import './Ventes.css';

const VentesList = () => {
    const [ventes, setVentes] = useState([]);
    const [totalJour, setTotalJour] = useState(0);

    useEffect(() => { loadVentes(); }, []);

    const loadVentes = async () => {
        const res = await api.get('/ventes');
        
        // Sécurité : Gère à la fois l'ancien format (tableau) et le nouveau format (objet)
        if (Array.isArray(res.data)) {
            // Ancien format (si backend pas encore déployé)
            const today = new Date().toLocaleDateString('fr-CA');
            const total = res.data
                .filter(v => String(v.date_vente).split('T')[0] === today)
                .reduce((sum, v) => sum + parseFloat(v.montant_total), 0);
            setVentes(res.data);
            setTotalJour(total);
        } else {
            // Nouveau format
            setVentes(res.data.ventes || []);
            setTotalJour(res.data.total_jour || 0);
        }
    };

    const updateStatut = async (id, nouveauStatut) => {
        try {
            await api.put(`/ventes/${id}`, { statut_livraison: nouveauStatut });
            loadVentes(); // Recharge la liste pour voir le changement
        } catch (err) {
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    return (
        <div>
            <h1>Historique des Ventes</h1>
            
            {/* TOTAL DU JOUR */}
            <div className="daily-total-box">
                <h3>Total des ventes du jour :</h3>
                <p className="daily-total-amount">{totalJour.toLocaleString()} FCFA</p>
            </div>

            <Link to="/ventes/new" className="action-btn">+ Nouvelle vente (POS)</Link>
            
            <div className="table-container">
                <table className="stock-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Montant Total</th>
                            <th>Payé</th>
                            <th>Reste</th>
                            <th>Paiement</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ventes.map(v => (
                            <tr key={v.id}>
                                <td>{v.id}</td>
                                <td>{parseFloat(v.montant_total).toLocaleString()} F</td>
                                <td style={{ color: '#4ade80' }}>{parseFloat(v.montant_paye).toLocaleString()} F</td>
                                <td style={{ color: parseFloat(v.reste) > 0 ? '#f87171' : '#4ade80', fontWeight: 'bold' }}>
                                    {parseFloat(v.reste).toLocaleString()} F
                                </td>
                                <td>{v.mode_paiement}</td>
                                <td>
                                    <span className={`status-tag ${v.statut_livraison === 'Livrée' ? 'status-delivered' : 'status-pending'}`}>
                                        {v.statut_livraison}
                                    </span>
                                </td>
                                <td>
                                    {/* Bouton Modifier */}
                                    <Link to={`/ventes/edit/${v.id}`} style={{ padding: '6px 12px', background: '#f59e0b', color: 'black', borderRadius: '6px', textDecoration: 'none', marginRight: '5px' }}>
                                        Modifier
                                    </Link>
                                    
                                    {/* Boutons de changement de statut */}
                                    {v.statut_livraison === 'En attente' && (
                                        <button onClick={() => updateStatut(v.id, 'Validée')} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}>
                                            Valider
                                        </button>
                                    )}
                                    {v.statut_livraison === 'Validée' && (
                                        <button onClick={() => updateStatut(v.id, 'Livrée')} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}>
                                            Livrer
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VentesList;