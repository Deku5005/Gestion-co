import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import './Achats.css';

const AchatsList = () => {
    const [achats, setAchats] = useState([]);

    useEffect(() => { loadAchats(); }, []);
    const loadAchats = async () => {
        const res = await api.get('/achats');
        setAchats(res.data);
    };

    return (
        <div>
            <h1>Historique des Achats</h1>
            <Link to="/achats/new" className="action-btn">+ Nouvel achat (Approvisionner)</Link>

            <table className="stock-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Fournisseur</th>
                        <th>Article</th>
                        <th>Quantité</th>
                        <th>Prix Total</th>
                    </tr>
                </thead>
                <tbody>
                    {achats.map(a => (
                        <tr key={a.id}>
                            <td>{a.id}</td>
                            <td>{new Date(a.date_achat).toLocaleDateString()}</td>
                            <td>{a.fournisseur_nom}</td>
                            <td>{a.article_nom}</td>
                            <td>{a.quantite}</td>
                            <td>{(a.quantite * a.prix_achat).toLocaleString()} FCFA</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AchatsList;