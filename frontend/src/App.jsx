import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Users, Truck, Wallet, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

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

import './App.css';

const Navbar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';

    return (
        <>
            {/* Overlay sombre pour fermer le menu sur mobile */}
            {isOpen && <div className="mobile-overlay" onClick={onClose}></div>}

            <nav className={`navbar ${isOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="avatar-circle">JD</div>
                    <div className="user-details">
                        <span className="user-role">UTILISATEUR</span>
                        <span className="user-name">{user.nom}</span>
                    </div>
                    {/* Bouton de fermeture sur mobile */}
                    <button className="close-btn-mobile" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="sidebar-section-title">MAIN</div>
                <div className="links">
                    <Link to="/bilan" className={isActive('/bilan')} onClick={onClose}><LayoutDashboard size={18} /> Dashboard / Bilan</Link>
                    <Link to="/ventes" className={isActive('/ventes')} onClick={onClose}><ShoppingCart size={18} /> Ventes</Link>
                    <Link to="/clients" className={isActive('/clients')} onClick={onClose}><Users size={18} /> Clients</Link>
                    
                    {(user.role === 'Admin' || user.role === 'Stock') && (
                        <>
                            <Link to="/stock" className={isActive('/stock')} onClick={onClose}><Package size={18} /> Stock</Link>
                            <Link to="/fournisseurs" className={isActive('/fournisseurs')} onClick={onClose}><Truck size={18} /> Fournisseurs</Link>
                        </>
                    )}
                    
                    {user.role === 'Admin' && (
                        <>
                            <Link to="/depenses" className={isActive('/depenses')} onClick={onClose}><Wallet size={18} /> Dépenses</Link>
                            <Link to="/register" className={isActive('/register')} onClick={onClose}><Users size={18} /> Créer compte</Link>
                        </>
                    )}

                    <Link to="/profile" className={isActive('/profile')} onClick={onClose}><Users size={18} /> Mon Profil</Link>
                </div>

                <div className="logout-container">
                    <button onClick={() => { logout(); onClose(); }}><LogOut size={18} /> Log Out</button>
                </div>
            </nav>
        </>
    );
};

function AppContent() {
    const { user, loading } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (loading) return <div className="loading-screen">Chargement...</div>;

    return (
        <div className={user ? 'app-container' : 'auth-wrapper'}>
            {user && <Navbar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />}
            
            <div className={user ? 'content' : 'auth-content'}>
                {/* Bouton Hamburger visible uniquement sur mobile */}
                {user && (
                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu size={24} />
                    </button>
                )}

                <Routes>
                    {/* ... Vos routes existantes ... */}
                    <Route path="/login" element={user ? <Navigate to="/bilan" replace /> : <Login />} />
                    <Route path="/register" element={<ProtectedRoute allowedRoles={['Admin']}><Register /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    
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