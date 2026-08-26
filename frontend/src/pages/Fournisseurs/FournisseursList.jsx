import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import './Fournisseurs.css';

const FournisseursList = () => {
    const [fournisseurs, setFournisseurs] = useState([]);
    useEffect(() => { loadFournisseurs(); }, []);
    const loadFournisseurs = async () => {
        const res = await api.get('/fournisseurs');
        setFournisseurs(res.data);
    };
    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce fournisseur ?')) {
            await api.delete(`/fournisseurs/${id}`);
            loadFournisseurs();
        }
    };
    return (
        <div>
            <h1>Gestion des Fournisseurs</h1>
            <Link to="/fournisseurs/new" className="action-btn">+ Ajouter un fournisseur</Link>
            <table className="stock-table">
                <thead><tr><th>ID</th><th>Nom</th><th>Historique</th><th>Actions</th></tr></thead>
                <tbody>
                    {fournisseurs.map(f => (
                        <tr key={f.id}>
                            <td>{f.id}</td>
                            <td>{f.nom}</td>
                            <td>{f.historique_approvisionnement || 'Aucun'}</td>
                            <td>
                                <Link to={`/fournisseurs/edit/${f.id}`} style={{ padding: '6px 12px', background: '#f59e0b', color: 'black', textDecoration: 'none', borderRadius: '6px', marginRight: '5px' }}>Modifier</Link>
                                <button onClick={() => handleDelete(f.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default FournisseursList;