import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import * as api from "../services/api";
import "./Settings.css";
export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [preferences, setPreferences] = useState({
    currency: "BRL",
    language: "pt-BR",
    notifications: true,
  });
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateUserSettings(profileData);
      updateUser(profileData);
      showMessage("success", "Perfil atualizado com sucesso!");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "As senhas não coincidem");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showMessage("error", "A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      await api.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      showMessage("success", "Senha atualizada com sucesso!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateUserSettings(preferences);
      showMessage("success", "Preferências salvas com sucesso!");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="settings-header">
            <h1 className="page-title">Configurações</h1>
            <p className="text-secondary">Gerencie seu perfil e preferências</p>
          </div>
          {}
          {message.text && (
            <div className={`settings-message ${message.type}`}>
              {message.type === "success" ? "✓" : "✕"} {message.text}
            </div>
          )}
          <div className="settings-layout">
            {}
            <div className="settings-tabs glass-card">
              <button
                className={`settings-tab ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <span className="tab-icon">👤</span>
                Perfil
              </button>
              <button
                className={`settings-tab ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                <span className="tab-icon">🔒</span>
                Senha
              </button>
              {}
            </div>
            {}
            <div className="settings-content glass-card">
              {}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileSubmit}>
                  <h3>Informações do Perfil</h3>
                  <p className="text-secondary mb-xl">
                    Atualize suas informações pessoais
                  </p>
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="form-input"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-input"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="seu@email.com"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </form>
              )}
              {}
              {activeTab === "password" && (
                <form onSubmit={handlePasswordSubmit}>
                  <h3>Alterar Senha</h3>
                  <p className="text-secondary mb-xl">
                    Mantenha sua conta segura com uma senha forte
                  </p>
                  <div className="form-group">
                    <label className="form-label" htmlFor="currentPassword">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      className="form-input"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="newPassword">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      className="form-input"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="form-input"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Atualizando..." : "Atualizar Senha"}
                  </button>
                </form>
              )}
              {}
              {}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
