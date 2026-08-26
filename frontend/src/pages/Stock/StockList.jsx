import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import './Stock.css';

const StockList = () => {
    const [articles, setArticles] = useState([]);

    useEffect(() => { loadArticles(); }, []);

    const loadArticles = async () => {
        const res = await api.get('/articles');
        setArticles(res.data);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cet article ?')) {
            await api.delete(`/articles/${id}`);
            loadArticles();
        }
    };

    return (
        <div>
            <h1>Stock / Articles</h1>
            <Link to="/stock/new" className="action-btn">+ Ajouter un article</Link>

            <table className="stock-table">
                <thead>
                    <tr>
                        <th>Désignation</th>
                        <th>Prix Achat</th>
                        <th>Prix Vente</th>
                        <th>Quantité</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {articles.map(article => (
                        <tr key={article.id}>
                            <td>{article.designation}</td>
                            <td>{article.prix_achat} FCFA</td>
                            <td>{article.prix_vente} FCFA</td>
                            <td>{article.quantite_disponible} {article.unite}</td>
                            <td>
                                <Link to={`/stock/edit/${article.id}`} style={{ padding: '6px 12px', background: '#f59e0b', color: 'black', textDecoration: 'none', borderRadius: '6px', marginRight: '5px' }}>Modifier</Link>
                                <button onClick={() => handleDelete(article.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockList;