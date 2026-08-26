import { useEffect, useState } from 'react';
import api from '../api/client';
import './Inventaire.css';

const Inventaire = () => {
    const [articles, setArticles] = useState([]);

    useEffect(() => { loadArticles(); }, []);

    const loadArticles = async () => {
        const res = await api.get('/articles');
        setArticles(res.data);
    };

    // Ajuster la quantité (ajouter ou retirer)
    const adjustStock = async (id, type) => {
        const article = articles.find(a => a.id === id);
        const newQty = type === 'add' ? article.quantite_disponible + 1 : article.quantite_disponible - 1;
        if (newQty < 0) return alert('Stock négatif impossible !');

        try {
            await api.put(`/articles/${id}`, { ...article, quantite_disponible: newQty });
            loadArticles();
        } catch (err) {
            alert('Erreur lors de la mise à jour du stock');
        }
    };

    const totalValue = articles.reduce((sum, a) => sum + (a.prix_achat * a.quantite_disponible), 0);

    return (
        <div>
            <h1>Inventaire & Stock</h1>
            <h3>Valeur totale du stock : {totalValue.toLocaleString()} FCFA</h3>
            <table className="stock-table">
                <thead>
                    <tr><th>Désignation</th><th>Quantité</th><th>Prix Achat</th><th>Valeur</th><th>Ajuster</th></tr>
                </thead>
                <tbody>
                    {articles.map(a => (
                        <tr key={a.id}>
                            <td>{a.designation}</td>
                            <td>{a.quantite_disponible}</td>
                            <td>{a.prix_achat} FCFA</td>
                            <td>{(a.quantite_disponible * a.prix_achat).toLocaleString()} FCFA</td>
                            <td>
                                <button onClick={() => adjustStock(a.id, 'add')}> + </button>
                                <button onClick={() => adjustStock(a.id, 'remove')}> - </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Inventaire;