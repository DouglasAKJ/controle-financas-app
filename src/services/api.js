const API_BASE_URL = "http://localhost:8080/api";
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: ` ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const text = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      if (text) {
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = text;
        }
      }
      throw new Error(errorMessage);
    }
    const text = await response.text();
    if (text) {
      try {
        return JSON.parse(text);
      } catch (e) {
        console.warn("Resposta da API não é JSON:", text);
        return text;
      }
    }
    return {};
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
export async function login(email, password) {
  localStorage.clear();
  const response = await fetchAPI("/user/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return {
    token: response.token,
  };
}
export async function register(username, email, password) {
  return fetchAPI("/user", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}
export async function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
export async function getUserProfile() {
  return fetchAPI("/user/get", { method: "GET" });
}
export async function getTransactions(filters = {}) {
  const transactions = await fetchAPI("/transaction/get", { method: "GET" });
  if (Array.isArray(transactions)) {
    return transactions.map((t) => ({
      ...t,
      id: t.id,
      valor: t.valor !== undefined ? t.valor : t.amount,
      categoria: t.categoria || t.category,
      tipo:
        t.tipo !== undefined
          ? t.tipo
          : t.type === "income"
            ? "ENTRADA"
            : t.type === "expense"
              ? "SAIDA"
              : t.type,
    }));
  }
  return transactions;
}
export async function createTransaction(transactionData) {
  const response = await fetchAPI("/transaction/create", {
    method: "POST",
    body: JSON.stringify(transactionData),
  });
  if (response && typeof response === "object" && "id" in response) {
    return {
      ...response,
      id: response.id != null ? Number(response.id) : response.id,
    };
  }
  return response;
}
export async function updateTransaction(id, transactionData) {
  return fetchAPI(`/transaction/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(transactionData),
  });
}
export async function deleteTransaction(id) {
  const numericId = id != null ? Number(id) : id;
  return fetchAPI(`/transaction/delete/${numericId}`, { method: "DELETE" });
}

export async function returnTransactionsByCategory(id) {
  return fetchAPI(`/transaction/transacoesPorCategoria`, { method: "POST", body: JSON.stringify({ id }) });
}

export async function getTransactionsByMonth(month) {
  return fetchAPI(`/transaction/month`, { method: "POST", body: JSON.stringify({ month }) });
}

export async function getTransactionsByYear(year) {
  return fetchAPI(`/transaction/year`, { method: "POST", body: JSON.stringify({ year }) });
}

export async function getCategories() {
  return fetchAPI("/category/get", { method: "GET" });
}
export async function createCategory(categoryData) {
  return fetchAPI("/category/create", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
}
export async function updateCategory(id, categoryData) {
  return fetchAPI(`/category/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  });
}
export async function deleteCategory(id) {
  return fetchAPI(`/category/delete/${id}`, { method: "DELETE" });
}
export async function updateUserSettings(settingsData) {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const updatedUser = { ...currentUser, ...settingsData };
  localStorage.setItem("user", JSON.stringify(updatedUser));
  return updatedUser;
}
export async function updatePassword(currentPassword, newPassword) {
  return fetchAPI("/user/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
export async function getFinancialSummary() {
  return fetchAPI("/transaction/dashboard", { method: "GET" });
}
