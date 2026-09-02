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
        setVentes(res.data.ventes);
        setTotalJour(res.data.total_jour);
    };

    const updateStatut = async (id, nouveauStatut) => {
        await api.put(`/ventes/${id}`, { statut_livraison: nouveauStatut });
        loadVentes();
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
            
            <table className="stock-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Montant</th>
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
                            <td>{v.montant_total.toLocaleString()} F</td>
                            <td style={{ color: '#4ade80' }}>{v.montant_paye.toLocaleString()} F</td>
                            <td style={{ color: v.reste > 0 ? '#f87171' : '#4ade80', fontWeight: 'bold' }}>{v.reste.toLocaleString()} F</td>
                            <td>{v.mode_paiement}</td>
                            <td><span className={`status-tag ${v.statut_livraison === 'Livrée' ? 'status-delivered' : 'status-pending'}`}>{v.statut_livraison}</span></td>
                            <td>
                                <Link to={`/ventes/edit/${v.id}`} style={{ padding: '5px 10px', background: '#f59e0b', color: 'black', borderRadius: '5px', textDecoration: 'none', marginRight: '5px' }}>Modifier</Link>
                                {v.statut_livraison === 'En attente' && (
                                    <button onClick={() => updateStatut(v.id, 'Validée')} style={{ background: '#3b82f6', color: 'white' }}>Valider</button>
                                )}
                                {v.statut_livraison === 'Validée' && (
                                    <button onClick={() => updateStatut(v.id, 'Livrée')} style={{ background: '#10b981', color: 'white' }}>Livrer</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VentesList;