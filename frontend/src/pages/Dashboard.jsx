import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TransactionCard from '../components/TransactionCard';
import TransactionModal from '../components/TransactionModal';
import * as api from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [transactionsData, categoriesData, summaryData] = await Promise.all([
                api.getTransactions(),
                api.getCategories(),
                api.getFinancialSummary(),
            ]);

            setTransactions(transactionsData);
            setCategories(categoriesData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const handleAddTransaction = async (transactionData) => {
        const result = await api.createTransaction(transactionData);

        // Se a API retornar apenas uma mensagem (string) ou objeto sem ID, recarregar os dados
        if (typeof result === 'string' || !result || !result.id) {
            await loadData();
            return;
        }

        // Se retornou o objeto completo, faz atualização otimista
        const newTransaction = result;
        setTransactions(prev => [newTransaction, ...prev]);

        // Atualiza o resumo
        setSummary(prev => ({
            ...prev,
            balance: transactionData.tipo === 'ENTRADA'
                ? prev.balance + transactionData.valor
                : prev.balance - transactionData.valor,
            totalIncome: transactionData.tipo === 'ENTRADA'
                ? prev.totalIncome + transactionData.valor
                : prev.totalIncome,
            totalExpense: transactionData.tipo === 'SAIDA'
                ? prev.totalExpense + transactionData.valor
                : prev.totalExpense,
        }));
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setModalOpen(true);
    };

    const handleUpdateTransaction = async (transactionData) => {
        await api.updateTransaction(editingTransaction.id, transactionData);
        setTransactions(prev =>
            prev.map(t => t.id === editingTransaction.id
                ? { ...t, ...transactionData }
                : t
            )
        );
        setEditingTransaction(null);
        loadData(); // Recarrega para atualizar o resumo
    };

    const handleDeleteTransaction = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta transação?')) return;

        try {
            // 1. Comando de exclusão na API
            await api.deleteTransaction(id);

            // 2. Atualização Otimista da UI (Remove o item sem nova requisição de lista)
            setTransactions(prev => prev.filter(t => t.id !== id));

            // 3. Atualização isolada do resumo financeiro
            const summaryData = await api.getFinancialSummary();
            setSummary(summaryData);
        } catch (error) {
            console.error('Falha ao excluir:', error);
            // Reverte o estado em caso de erro no servidor
            loadData();
        }
    };

    const openNewTransactionModal = () => {
        setEditingTransaction(null);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingTransaction(null);
    };

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'all') return true;
        return t.tipo === filter;
    });

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="page">
                    <div className="container">
                        <div className="loading-screen">
                            <div className="loading-spinner"></div>
                            <p>Carregando dados...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="page">
                <div className="container">
                    {/* Header */}
                    <div className="dashboard-header">
                        <div>
                            <h1 className="page-title">Dashboard</h1>
                            <p className="text-secondary">Acompanhe suas finanças</p>
                        </div>
                        <button className="btn btn-primary" onClick={openNewTransactionModal}>
                            + Nova Transação
                        </button>
                    </div>

                    {/* Cards de Resumo */}
                    <div className="summary-grid">
                        <div className="summary-card balance">
                            <div className="summary-icon">💰</div>
                            <div className="summary-content">
                                <span className="summary-label">Saldo Atual</span>
                                <span className="summary-value">{formatCurrency(summary?.saldoAtual || 0)}</span>
                            </div>
                        </div>

                        <div className="summary-card income">
                            <div className="summary-icon">↗</div>
                            <div className="summary-content">
                                <span className="summary-label">Entradas</span>
                                <span className="summary-value text-success">
                                    {formatCurrency(summary?.entradas || 0)}
                                </span>
                            </div>
                        </div>

                        <div className="summary-card expense">
                            <div className="summary-icon">↙</div>
                            <div className="summary-content">
                                <span className="summary-label">Saídas</span>
                                <span className="summary-value text-danger">
                                    {formatCurrency(summary?.saidas || 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Seção de Transações */}
                    <div className="transactions-section">
                        <div className="transactions-header">
                            <h2>Transações Recentes</h2>
                            <div className="filter-buttons">
                                <button
                                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilter('all')}
                                >
                                    Todas
                                </button>
                                <button
                                    className={`filter-btn ${filter === 'ENTRADA' ? 'active' : ''}`}
                                    onClick={() => setFilter('ENTRADA')}
                                >
                                    Entradas
                                </button>
                                <button
                                    className={`filter-btn ${filter === 'SAIDA' ? 'active' : ''}`}
                                    onClick={() => setFilter('SAIDA')}
                                >
                                    Saídas
                                </button>
                            </div>
                        </div>

                        <div className="transactions-list">
                            {filteredTransactions.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">📭</span>
                                    <p>Nenhuma transação encontrada</p>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={openNewTransactionModal}
                                    >
                                        Adicionar primeira transação
                                    </button>
                                </div>
                            ) : (
                                filteredTransactions.map(transaction => (
                                    <TransactionCard
                                        key={transaction.id}
                                        transaction={transaction}
                                        onEdit={handleEditTransaction}
                                        onDelete={handleDeleteTransaction}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <TransactionModal
                isOpen={modalOpen}
                onClose={closeModal}
                onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                categories={categories}
                transaction={editingTransaction}
            />
        </>
    );
}
