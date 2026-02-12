import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = !!user;

    useEffect(() => {

        // Ao carregar a aplicação, verifica se há token válido
        // e busca os dados atualizados do usuário
        const initAuth = async () => {
            const savedToken = localStorage.getItem('token');

            if (savedToken != null) {
                try {
                    // Busca dados atualizados do usuário usando o token
                    const userData = await api.getUserProfile();

                    // Atualiza cache local
                    localStorage.setItem('user', JSON.stringify(userData));

                    setUser(userData);
                } catch (error) {
                    // Token inválido ou expirado - limpa tudo
                    console.error('Erro ao buscar perfil do usuário:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);

                }
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            // 1. Faz login e recebe o token
            const response = await api.login(email, password);

            // 2. Salva o token
            localStorage.setItem('token', response.token);

            // 3. Busca os dados completos do usuário usando o token
            const userData = await api.getUserProfile();

            // 4. Salva e define o usuário com os dados completos
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await api.register(name, email, password);

            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            setUser(response.user);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
    };

    const updateUser = (userData) => {
        const updatedUser = { ...user, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }

    return context;
}
