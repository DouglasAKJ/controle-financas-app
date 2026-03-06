import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import TransactionCard from "../components/TransactionCard";
import TransactionModal from "../components/TransactionModal";
import * as api from "../services/api";
import "./Dashboard.css";
export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categoryTransactions, setCategoryTransactions] = useState(null);
  const [categorySummary, setCategorySummary] = useState(null);
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    setLoading(true);
    try {
      const [transactionsData, categoriesData, summaryData] = await Promise.all(
        [api.getTransactions(), api.getCategories(), api.getFinancialSummary()],
      );
      setTransactions(transactionsData);
      setCategories(categoriesData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  const handleAddTransaction = async (transactionData) => {
    const result = await api.createTransaction(transactionData);
    if (typeof result === "string" || !result || !result.id) {
      await loadData();
      return;
    }
    const newTransaction = result;
    setTransactions((prev) => [newTransaction, ...prev]);
    setSummary((prev) => ({
      ...prev,
      balance:
        transactionData.tipo === "ENTRADA"
          ? prev.balance + transactionData.valor
          : prev.balance - transactionData.valor,
      totalIncome:
        transactionData.tipo === "ENTRADA"
          ? prev.totalIncome + transactionData.valor
          : prev.totalIncome,
      totalExpense:
        transactionData.tipo === "SAIDA"
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
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === editingTransaction.id ? { ...t, ...transactionData } : t,
      ),
    );
    setEditingTransaction(null);
    loadData();
  };
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta transação?"))
      return;
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      const summaryData = await api.getFinancialSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error("Falha ao excluir:", error);
      loadData();
    }
  };
  const handleCategoryChange = async (e) => {
    const value = e.target.value;
    setCategoryFilter(value);
    if (value === "all") {
      setCategoryTransactions(null);
      setCategorySummary(null);
    } else {
      try {
        const result = await api.returnTransactionsByCategory(value);
        const selectedCategory = categories.find((cat) => String(cat.id) === String(value));
        const categoryName = selectedCategory ? selectedCategory.categoria : "";
        if (result && !Array.isArray(result)) {
          const transactionsList = result.transacoes || [];
          setCategoryTransactions(transactionsList);
          setCategorySummary({
            entradas: result.valorEntrada || 0,
            saidas: result.valorSaida || 0,
            total: result.saldoAtual || 0,
            categoryName,
          });
        } else {
          setCategoryTransactions(Array.isArray(result) ? result : []);
          setCategorySummary(null);
        }
      } catch (error) {
        console.error("Erro ao filtrar por categoria:", error);
        setCategoryTransactions([]);
        setCategorySummary(null);
      }
    }
  };
  const handleMonthChange = async (e) => {
    const value = e.target.value;
    setMonthFilter(value);
    if (value === "all") {
      await loadData();
    } else {
      try {
        setLoading(true);
        const result = await api.getTransactionsByMonth(Number(value));
        const list = Array.isArray(result) ? result : (result?.transacoes || []);
        setTransactions(list);
      } catch (error) {
        console.error("Erro ao filtrar por mês:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  const handleYearChange = async (e) => {
    const value = e.target.value;
    setYearFilter(value);
    if (value === "all") {
      await loadData();
    } else {
      try {
        setLoading(true);
        const result = await api.getTransactionsByYear(Number(value));
        const list = Array.isArray(result) ? result : (result?.transacoes || []);
        setTransactions(list);
      } catch (error) {
        console.error("Erro ao filtrar por ano:", error);
      } finally {
        setLoading(false);
      }
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
  const baseTransactions = categoryTransactions !== null ? categoryTransactions : transactions;
  const filteredTransactions = baseTransactions.filter((t) => {
    if (filter === "all") return true;
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
          { }
          <div className="dashboard-header">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="text-secondary">Acompanhe suas finanças</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={openNewTransactionModal}
            >
              + Nova Transação
            </button>
          </div>
          { }
          <div className="summary-grid">
            <div className="summary-card balance">
              <div className="summary-icon">💰</div>
              <div className="summary-content">
                <span className="summary-label">{categorySummary ? "Total" : "Saldo Atual"}</span>
                <span className="summary-value">
                  {formatCurrency(categorySummary ? categorySummary.total : (summary?.saldoAtual || 0))}
                </span>
              </div>
            </div>
            <div className="summary-card income">
              <div className="summary-icon">↗</div>
              <div className="summary-content">
                <span className="summary-label">
                  {categorySummary ? `Entradas - ${categorySummary.categoryName}` : "Entradas"}
                </span>
                <span className="summary-value text-success">
                  {formatCurrency(categorySummary ? categorySummary.entradas : (summary?.entradas || 0))}
                </span>
              </div>
            </div>
            <div className="summary-card expense">
              <div className="summary-icon">↙</div>
              <div className="summary-content">
                <span className="summary-label">
                  {categorySummary ? `Saídas - ${categorySummary.categoryName}` : "Saídas"}
                </span>
                <span className="summary-value text-danger">
                  {formatCurrency(categorySummary ? categorySummary.saidas : (summary?.saidas || 0))}
                </span>
              </div>
            </div>
          </div>
          { }
          <div className="transactions-section">
            <div className="transactions-header">
              <h2>Transações Recentes</h2>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  Todas
                </button>
                <button
                  className={`filter-btn ${filter === "ENTRADA" ? "active" : ""}`}
                  onClick={() => setFilter("ENTRADA")}
                >
                  Entradas
                </button>
                <button
                  className={`filter-btn ${filter === "SAIDA" ? "active" : ""}`}
                  onClick={() => setFilter("SAIDA")}
                >
                  Saídas
                </button>
              </div>
              <div className="category-filter">
                <select
                  className="category-filter-select"
                  value={monthFilter}
                  onChange={handleMonthChange}
                >
                  <option value="all">Todos os meses</option>
                  <option value="1">Janeiro</option>
                  <option value="2">Fevereiro</option>
                  <option value="3">Março</option>
                  <option value="4">Abril</option>
                  <option value="5">Maio</option>
                  <option value="6">Junho</option>
                  <option value="7">Julho</option>
                  <option value="8">Agosto</option>
                  <option value="9">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
                <select
                  className="category-filter-select"
                  value={yearFilter}
                  onChange={handleYearChange}
                >
                  <option value="all">Todos os anos</option>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
                <select
                  className="category-filter-select"
                  value={categoryFilter}
                  onChange={handleCategoryChange}
                >
                  <option value="all">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.categoria}
                    </option>
                  ))}
                </select>
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
                filteredTransactions.map((transaction) => (
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
      </div >
      <TransactionModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={
          editingTransaction ? handleUpdateTransaction : handleAddTransaction
        }
        categories={categories}
        transaction={editingTransaction}
      />
    </>
  );
}
