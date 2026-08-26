import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import './Depenses.css';

const DepensesList = () => {
    const [depenses, setDepenses] = useState([]);
    useEffect(() => { loadDepenses(); }, []);
    const loadDepenses = async () => {
        const res = await api.get('/depenses');
        setDepenses(res.data);
    };
    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette dépense ?')) {
            await api.delete(`/depenses/${id}`);
            loadDepenses();
        }
    };
    return (
        <div>
            <h1>Gestion des Dépenses</h1>
            <Link to="/depenses/new" className="action-btn">+ Ajouter une dépense</Link>
            <table className="stock-table">
                <thead><tr><th>ID</th><th>Libellé</th><th>Montant</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                    {depenses.map(d => (
                        <tr key={d.id}>
                            <td>{d.id}</td>
                            <td>{d.libelle}</td>
                            <td>{d.montant} FCFA</td>
                            <td>{new Date(d.date_depense).toLocaleDateString()}</td>
                            <td>
                                <Link to={`/depenses/edit/${d.id}`} style={{ padding: '6px 12px', background: '#f59e0b', color: 'black', textDecoration: 'none', borderRadius: '6px', marginRight: '5px' }}>Modifier</Link>
                                <button onClick={() => handleDelete(d.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default DepensesList;