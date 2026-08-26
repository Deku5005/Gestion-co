import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import './Ventes.css';

const VentesList = () => {
    const [ventes, setVentes] = useState([]);

    useEffect(() => { loadVentes(); }, []);

    const loadVentes = async () => {
        const res = await api.get('/ventes');
        setVentes(res.data);
    };

    // Fonction pour changer le statut
    const updateStatut = async (id, nouveauStatut) => {
        try {
            await api.put(`/ventes/${id}`, { statut_livraison: nouveauStatut });
            loadVentes(); // On recharge la liste pour voir le changement
        } catch (err) {
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    return (
        <div>
            <h1>Historique des Ventes</h1>
            <Link to="/ventes/new" className="action-btn">+ Nouvelle vente (POS)</Link>
            
            <table className="stock-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Paiement</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ventes.map(v => (
                        <tr key={v.id}>
                            <td>{v.id}</td>
                            <td>{new Date(v.date_vente).toLocaleDateString()}</td>
                            <td>{v.montant_total} FCFA</td>
                            <td>{v.mode_paiement}</td>
                            <td style={{ fontWeight: 'bold', color: v.statut_livraison === 'Livrée' ? '#4ade80' : '#fbbf24' }}>
                                {v.statut_livraison}
                            </td>
                            <td>
                                {/* Bouton pour passer de "En attente" à "Validée" */}
                                {v.statut_livraison === 'En attente' && (
                                    <button onClick={() => updateStatut(v.id, 'Validée')} style={{ background: '#3b82f6', color: 'white' }}>
                                        Valider
                                    </button>
                                )}
                                {/* Bouton pour passer de "Validée" à "Livrée" */}
                                {v.statut_livraison === 'Validée' && (
                                    <button onClick={() => updateStatut(v.id, 'Livrée')} style={{ background: '#10b981', color: 'white' }}>
                                        Livrer
                                    </button>
                                )}
                                {/* Si déjà livrée, on n'affiche plus de bouton */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VentesList;