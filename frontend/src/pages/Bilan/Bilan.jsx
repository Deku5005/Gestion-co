import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/client';
import './Bilan.css';

const Bilan = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        api.get('/bilan').then(res => setStats(res.data));
        api.get('/bilan/charts')
            .then(res => {
            // Sécurité : si ce n'est pas un tableau, on met un tableau vide
            setChartData(Array.isArray(res.data) ? res.data : []);
        })
    .catch(() => setChartData([]));
    }, []);

    if (!stats) return <div className="loading-screen">Chargement du bilan...</div>;

    const formatFCFA = (n) => n.toLocaleString() + ' FCFA';

    // Données fictives pour le graphique circulaire si pas de données réelles
    const pieData = [
        { name: 'Ventes', value: stats.ca },
        { name: 'Dépenses', value: stats.total_depenses },
    ];
    const COLORS = ['#4ade80', '#f87171'];

    return (
        <div>
            <h1>Dashboard / Bilan Général</h1>
            
            <div className="stats-grid">
                <div className="stat-card"><h3>Chiffre d'Affaires</h3><p className="stat-vente">{formatFCFA(stats.ca)}</p><span>{stats.nb_ventes} ventes</span></div>
                <div className="stat-card"><h3>Bénéfice Net</h3><p className={stats.benefice_net >= 0 ? 'stat-positif' : 'stat-negatif'}>{stats.benefice_net >= 0 ? '+' : '-'}{formatFCFA(Math.abs(stats.benefice_net))}</p><span>CA - Dépenses</span></div>
                <div className="stat-card"><h3>Dépenses Total</h3><p className="stat-depense">{formatFCFA(stats.total_depenses)}</p><span>Frais généraux</span></div>
                <div className="stat-card"><h3>Valeur du Stock</h3><p className="stat-stock">{formatFCFA(stats.valeur_stock)}</p><span>Au prix d'achat</span></div>
                <div className="stat-card"><h3>Clients Actifs</h3><p>{stats.nb_clients}</p><span>Dans le répertoire</span></div>
                <div className="stat-card"><h3>Alertes Stock</h3><p className={stats.nb_alertes > 0 ? 'stat-alerte' : 'stat-positif'}>{stats.nb_alertes}</p><span>Produits à réapprovisionner</span></div>
            </div>

            {/* Graphique à barres (Ventes 7 jours) */}
            <div className="chart-container">
                <h3 className="chart-title">Ventes des 7 derniers jours</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <defs>
                            <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="jour" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                        <Bar dataKey="total" fill="url(#colorVentes)" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Graphique circulaire (Répartition CA / Dépenses) */}
            <div className="chart-container">
                <h3 className="chart-title">Répartition des flux financiers</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value">
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Bilan;