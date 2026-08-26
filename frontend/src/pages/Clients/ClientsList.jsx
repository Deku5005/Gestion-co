import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import './Clients.css';

const ClientsList = () => {
    const [clients, setClients] = useState([]);

    useEffect(() => { loadClients(); }, []);

    const loadClients = async () => {
        const res = await api.get('/clients');
        setClients(res.data);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce client ?')) {
            await api.delete(`/clients/${id}`);
            loadClients();
        }
    };

    return (
        <div>
            <h1>Gestion Clients / Crédits</h1>
            <Link to="/clients/new" className="action-btn">+ Ajouter un client</Link>

            <table className="stock-table">
                <thead><tr><th>ID</th><th>Nom</th><th>Crédit</th><th>Actions</th></tr></thead>
                <tbody>
                    {clients.map(client => (
                        <tr key={client.id}>
                            <td>{client.id}</td>
                            <td>{client.nom}</td>
                            <td>{client.solde_credit} FCFA</td>
                            <td>
                                <Link to={`/clients/edit/${client.id}`} style={{ padding: '6px 12px', background: '#f59e0b', color: 'black', textDecoration: 'none', borderRadius: '6px', marginRight: '5px' }}>Modifier</Link>
                                <button onClick={() => handleDelete(client.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClientsList;