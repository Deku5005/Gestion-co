import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Users, Truck, Wallet, LogOut } from 'lucide-react';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

import StockList from './pages/Stock/StockList';
import StockForm from './pages/Stock/StockForm';
import ClientsList from './pages/Clients/ClientsList';
import ClientsForm from './pages/Clients/ClientsForm';
import FournisseursList from './pages/Fournisseurs/FournisseursList';
import FournisseursForm from './pages/Fournisseurs/FournisseursForm';
import DepensesList from './pages/Depenses/DepensesList';
import DepensesForm from './pages/Depenses/DepensesForm';
import VentesList from './pages/Ventes/VentesList';
import VentesForm from './pages/Ventes/VentesForm';
import Bilan from './pages/Bilan/Bilan';
import AchatsList from './pages/Achats/AchatsList';
import AchatsForm from './pages/Achats/AchatsForm';

import './App.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="sidebar-header">
                <div className="avatar-circle">JD</div>
                <div className="user-details">
                    <span className="user-role">UTILISATEUR</span>
                    <span className="user-name">{user.nom}</span>
                </div>
            </div>

            <div className="sidebar-section-title">MAIN</div>
            <div className="links">
                <Link to="/bilan" className={isActive('/bilan')}><LayoutDashboard size={18} /> Dashboard / Bilan</Link>
                <Link to="/ventes" className={isActive('/ventes')}><ShoppingCart size={18} /> Ventes</Link>
                <Link to="/clients" className={isActive('/clients')}><Users size={18} /> Clients</Link>
                
                {(user.role === 'Admin' || user.role === 'Stock') && (
                    <>
                        <Link to="/stock" className={isActive('/stock')}><Package size={18} /> Stock</Link>
                        <Link to="/fournisseurs" className={isActive('/fournisseurs')}><Truck size={18} /> Fournisseurs</Link>
                        <Link to="/achats" className={isActive('/achats')}><Package size={18} /> Achats / Approvisionnement</Link>
                    </>
                )}
                
                {user.role === 'Admin' && (
                    <>
                        <Link to="/depenses" className={isActive('/depenses')}><Wallet size={18} /> Dépenses</Link>
                        <Link to="/register" className={isActive('/register')}><Users size={18} /> Créer compte</Link>
                    </>
                )}

                <Link to="/profile" className={isActive('/profile')}><Users size={18} /> Mon Profil</Link>
            </div>

            <div className="logout-container">
                <button onClick={logout}><LogOut size={18} /> Log Out</button>
            </div>
        </nav>
    );
};

function AppContent() {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading-screen">Chargement...</div>;

    return (
        <div className={user ? 'app-container' : 'auth-wrapper'}>
            {user && <Navbar />}
            <div className={user ? 'content' : 'auth-content'}>
                <Routes>
                    <Route path="/login" element={user ? <Navigate to="/bilan" replace /> : <Login />} />
                    <Route path="/register" element={<ProtectedRoute allowedRoles={['Admin']}><Register /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/achats" element={<ProtectedRoute allowedRoles={['Admin', 'Stock']}><AchatsList /></ProtectedRoute>} />
                    <Route path="/achats/new" element={<ProtectedRoute allowedRoles={['Admin', 'Stock']}><AchatsForm /></ProtectedRoute>} />

                    <Route path="/stock" element={<ProtectedRoute allowedRoles={['Admin', 'Stock']}><StockList /></ProtectedRoute>} />
                    <Route path="/stock/new" element={<ProtectedRoute allowedRoles={['Admin', 'Stock']}><StockForm /></ProtectedRoute>} />
                    <Route path="/stock/edit/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Stock']}><StockForm /></ProtectedRoute>} />

                    <Route path="/clients" element={<ProtectedRoute allowedRoles={['Admin', 'Vendeur']}><ClientsList /></ProtectedRoute>} />
                    <Route path="/clients/new" element={<ProtectedRoute allowedRoles={['Admin', 'Vendeur']}><ClientsForm /></ProtectedRoute>} />
                    <Route path="/clients/edit/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Vendeur']}><ClientsForm /></ProtectedRoute>} />

                    <Route path="/fournisseurs" element={<ProtectedRoute allowedRoles={['Admin', 'Stock']}><FournisseursList /></ProtectedRoute>} />
                    <Route path="/fournisseurs/new" element={<ProtectedRoute allowedRoles={['Admin', 'Stock']}><FournisseursForm /></ProtectedRoute>} />
                    <Route path="/fournisseurs/edit/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Stock']}><FournisseursForm /></ProtectedRoute>} />

                    <Route path="/depenses" element={<ProtectedRoute allowedRoles={['Admin']}><DepensesList /></ProtectedRoute>} />
                    <Route path="/depenses/new" element={<ProtectedRoute allowedRoles={['Admin']}><DepensesForm /></ProtectedRoute>} />
                    <Route path="/depenses/edit/:id" element={<ProtectedRoute allowedRoles={['Admin']}><DepensesForm /></ProtectedRoute>} />

                    <Route path="/ventes" element={<ProtectedRoute allowedRoles={['Admin', 'Vendeur']}><VentesList /></ProtectedRoute>} />
                    <Route path="/ventes/new" element={<ProtectedRoute allowedRoles={['Admin', 'Vendeur']}><VentesForm /></ProtectedRoute>} />

                    <Route path="/bilan" element={<ProtectedRoute><Bilan /></ProtectedRoute>} />
                    
                    <Route path="/" element={ user ? <Navigate to="/bilan" replace /> : <Navigate to="/login" replace /> } />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;