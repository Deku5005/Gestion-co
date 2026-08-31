import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './Inventaire.css';

const Inventaire = () => {
    const { user } = useAuth();
    const [articles, setArticles] = useState([]);
    const [counts, setCounts] = useState({});
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        const res = await api.get('/inventaires');
        setArticles(res.data);
        // Initialiser les comptes avec la quantité théorique
        const initialCounts = {};
        res.data.forEach(a => initialCounts[a.id] = a.quantite_disponible);
        setCounts(initialCounts);
    };

    const handleCountChange = (id, value) => {
        setCounts({ ...counts, [id]: value });
    };

    const handleValidate = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir valider cet inventaire ? Le stock sera ajusté.')) return;

        const payload = articles.map(a => ({
            article_id: a.id,
            quantite_comptee: parseInt(counts[a.id]) || 0
        }));

        try {
            const res = await api.post('/inventaires/validate', { articles: payload, utilisateur_id: user.id });
            setMessage(res.data.message);
            setTimeout(() => setMessage(''), 3000);
            loadArticles();
        } catch (err) {
            alert('Erreur : ' + err.response?.data);
        }
    };

    return (
        <div>
            <h1>Inventaire Physique</h1>
            {message && <p className="message">{message}</p>}
            <p style={{ color: '#94a3b8' }}>Comptez vos articles en rayon et saisissez la quantité réelle.</p>
            
            <div className="table-container">
                <table className="stock-table">
                    <thead>
                        <tr>
                            <th>Article</th>
                            <th>Théorique</th>
                            <th>Compté</th>
                            <th>Écart</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map(a => {
                            const ecart = (parseInt(counts[a.id]) || 0) - a.quantite_disponible;
                            return (
                                <tr key={a.id}>
                                    <td>{a.designation}</td>
                                    <td>{a.quantite_disponible}</td>
                                    <td>
                                        <input 
                                            type="number" 
                                            value={counts[a.id] || ''} 
                                            onChange={(e) => handleCountChange(a.id, e.target.value)}
                                            className="count-input"
                                        />
                                    </td>
                                    <td style={{ color: ecart !== 0 ? '#f87171' : '#4ade80', fontWeight: 'bold' }}>
                                        {ecart !== 0 ? (ecart > 0 ? '+' : '') + ecart : 'OK'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <button className="action-btn" onClick={handleValidate} style={{ marginTop: '20px' }}>
                Valider l'Inventaire
            </button>
        </div>
    );
};

export default Inventaire;