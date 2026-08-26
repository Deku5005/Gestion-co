import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import './Clients.css';

const ClientsForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [form, setForm] = useState({ nom: '', solde_credit: 0 });

    useEffect(() => {
        if (isEditing) {
            api.get(`/clients/${id}`).then(res => setForm(res.data));
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await api.put(`/clients/${id}`, form);
        } else {
            await api.post('/clients', form);
        }
        navigate('/clients');
    };

    return (
        <div>
            <h1>{isEditing ? "Modifier le client" : "Ajouter un client"}</h1>
            <Link to="/clients" className="action-btn" style={{ background: '#64748b' }}>← Retour à la liste</Link>

            <form onSubmit={handleSubmit} className="form-container">
                <input type="text" placeholder="Nom du client" value={form.nom} onChange={(e) => setForm({...form, nom: e.target.value})} required />
                <input type="number" placeholder="Crédit initial (FCFA)" value={form.solde_credit} onChange={(e) => setForm({...form, solde_credit: e.target.value})} />
                <button type="submit">{isEditing ? "Enregistrer" : "Ajouter"}</button>
            </form>
        </div>
    );
};

export default ClientsForm;