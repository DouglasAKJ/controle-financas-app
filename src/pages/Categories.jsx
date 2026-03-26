import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import * as api from "../services/api";
import "./Categories.css";
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoria: "",
    color: "#6366f1",
  });
  const [error, setError] = useState("");
  useEffect(() => {
    loadCategories();
  }, []);
  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const resetForm = () => {
    setFormData({ categoria: "", color: "#6366f1" });
    setEditingCategory(null);
    setShowForm(false);
    setError("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.categoria.trim()) {
      setError("Nome da categoria é obrigatório");
      return;
    }
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, formData);
        console.log("editou categoria", formData);
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, ...formData } : c,
          ),
        );
      } else {
        console.log("criou categoria", formData);
        const newCategory = await api.createCategory(formData);
        setCategories((prev) => [...prev, newCategory]);
      }
      resetForm();
    } catch (error) {
      setError(error.message);
    }
  };
  const handleEdit = (category) => {
    setFormData({
      categoria: category.categoria || "",
      color: category.color,
    });
    setEditingCategory(category);
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?"))
      return;
    try {
      await api.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
    }
  };
  const predefinedColors = [
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#22d3ee",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page">
          <div className="container">
            <div className="loading-screen">
              <div className="loading-spinner"></div>
              <p>Carregando categorias...</p>
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
          {}
          <div className="categories-header">
            <div>
              <h1 className="page-title">Categorias</h1>
              <p className="text-secondary">
                Gerencie suas categorias de transações
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "✕ Cancelar" : "+ Nova Categoria"}
            </button>
          </div>
          {}
          {showForm && (
            <div className="category-form-card glass-card">
              <h3>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="categoria">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="categoria"
                    name="categoria"
                    className="form-input"
                    value={formData.categoria}
                    onChange={handleChange}
                    placeholder="Ex: Alimentação"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cor</label>
                  <div className="color-picker">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-btn ${formData.color === color ? "active" : ""}`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, color }))
                        }
                      />
                    ))}
                    <input
                      type="color"
                      className="color-input"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                {error && <div className="form-error-box">{error}</div>}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCategory ? "Atualizar" : "Criar Categoria"}
                  </button>
                </div>
              </form>
            </div>
          )}
          {}
          <div className="categories-grid">
            {categories.length === 0 ? (
              <div className="empty-state glass-card">
                <span className="empty-icon">—</span>
                <p>Nenhuma categoria criada</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowForm(true)}
                >
                  Criar primeira categoria
                </button>
              </div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="category-card glass-card">
                  <div
                    className="category-color"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="category-info">
                    <h4 className="category-name">
                      {category.categoria || category.name}
                    </h4>
                  </div>
                  <div className="category-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleEdit(category)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
