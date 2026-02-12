import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <span className="navbar-logo">💰</span>
                    <span className="navbar-title">FinanceApp</span>
                </div>

                <div className="navbar-menu">
                    <NavLink
                        to="/"
                        className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="navbar-icon">📊</span>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/categories"
                        className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="navbar-icon">🏷️</span>
                        Categorias
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="navbar-icon">⚙️</span>
                        Configurações
                    </NavLink>
                </div>

                <div className="navbar-user">
                    <span className="navbar-username">{user?.name || 'Usuário'}</span>
                    <button onClick={handleLogout} className="navbar-logout">
                        Sair
                    </button>
                </div>
            </div>
        </nav>
    );
}
