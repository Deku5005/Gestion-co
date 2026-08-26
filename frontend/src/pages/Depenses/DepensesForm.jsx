import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import './Depenses.css';

const DepensesForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [form, setForm] = useState({ libelle: '', montant: '' });

    useEffect(() => {
        if (isEditing) {
            api.get(`/depenses/${id}`).then(res => setForm(res.data));
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await api.put(`/depenses/${id}`, form);
        } else {
            await api.post('/depenses', form);
        }
        navigate('/depenses');
    };

    return (
        <div>
            <h1>{isEditing ? "Modifier la dépense" : "Ajouter une dépense"}</h1>
            <Link to="/depenses" className="action-btn" style={{ background: '#64748b' }}>← Retour à la liste</Link>

            <form onSubmit={handleSubmit} className="form-container">
                <input type="text" placeholder="Libellé (ex: Loyer, Electricité)" value={form.libelle} onChange={(e) => setForm({...form, libelle: e.target.value})} required />
                <input type="number" placeholder="Montant (FCFA)" value={form.montant} onChange={(e) => setForm({...form, montant: e.target.value})} required />
                <button type="submit">{isEditing ? "Enregistrer" : "Ajouter"}</button>
            </form>
        </div>
    );
};
export default DepensesForm;