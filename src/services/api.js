
const API_BASE_URL = 'http://localhost:8080/api';

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': ` ${token}` }),
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
        console.warn('Resposta da API não é JSON:', text);
        return text;
      }
    }

    return {};
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/* ============================================
   Autenticação
   ============================================ */


export async function login(email, password) {
  localStorage.clear();

  const response = await fetchAPI('/user/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  return {
    token: response.token
  };
}

/**
 * Registra um novo usuário
 * @param {string} username - Nome do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<{token: string, user: object}>}
 */
export async function register(username, email, password) {


  return fetchAPI('/user', { method: 'POST', body: JSON.stringify({ username, email, password }) });

}

/**
 * Realiza logout do usuário
 */
export async function logout() {
  // PLACEHOLDER: Limpa dados locais
  // TODO: Chamar endpoint de logout no backend se necessário
  // await fetchAPI('/auth/logout', { method: 'POST' });

  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Busca os dados do usuário autenticado
 * Requer token válido no localStorage
 * @returns {Promise<object>} Dados do usuário
 */
export async function getUserProfile() {
  // Busca dados do usuário usando o token do header
  return fetchAPI('/user/get', { method: 'GET' });
}

/* ============================================
   Transações
   ============================================ */

/**
 * Busca todas as transações do usuário
 * @param {object} filters - Filtros opcionais (tipo, categoria, data)
 * @returns {Promise<Array>}
 */
export async function getTransactions(filters = {}) {
  const transactions = await fetchAPI('/transaction/get', { method: 'GET' });

  // Garante que o campo 'valor' exista (mapeando de 'amount' se necessário)
  if (Array.isArray(transactions)) {
    return transactions.map(t => ({
      ...t,
      // Garante que o ID sempre seja numérico no front
      id: t.id,
      valor: t.valor !== undefined ? t.valor : t.amount,
      categoria: t.categoria || t.category, // Mapping category/categoria too just in case
      tipo: t.tipo !== undefined ? t.tipo : (t.type === 'income' ? 'ENTRADA' : t.type === 'expense' ? 'SAIDA' : t.type) // Mapeia type para tipo se necessário
    }));
  }

  return transactions;
}

/**
 * Cria uma nova transação
 * @param {object} transactionData - Dados da transação
 * @returns {Promise<object>}
 */
export async function createTransaction(transactionData) {

  const response = await fetchAPI('/transaction/create', {
    method: 'POST',
    body: JSON.stringify(transactionData),
  })

  // Normaliza ID para number, caso a API retorne como string
  if (response && typeof response === 'object' && 'id' in response) {
    return {
      ...response,
      id: response.id != null ? Number(response.id) : response.id,
    };
  }

  return response;

}

/**
 * Atualiza uma transação existente
 * @param {number} id - ID da transação
 * @param {object} transactionData - Dados atualizados
 * @returns {Promise<object>}
 */
export async function updateTransaction(id, transactionData) {

  return fetchAPI(`/transaction/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(transactionData),
  });

}

/**
 * Deleta uma transação
 * @param {number} id - ID da transação
 * @returns {Promise<void>}
 */
export async function deleteTransaction(id) {

  const numericId = id != null ? Number(id) : id;

  return fetchAPI(`/transaction/delete/${numericId}`, { method: 'DELETE' });
}

/* ============================================
   Categorias
   ============================================ */

/**
 * Busca todas as categorias
 * @returns {Promise<Array>}
 */
export async function getCategories() {

  return fetchAPI('/category/get', { method: 'GET' });
}

/**
 * Cria uma nova categoria
 * @param {object} categoryData - Dados da categoria
 * @returns {Promise<object>}
 */
export async function createCategory(categoryData) {

  return fetchAPI('/category/create', { method: 'POST', body: JSON.stringify(categoryData) });

}

/**
 * Atualiza uma categoria existente
 * @param {number} id - ID da categoria
 * @param {object} categoryData - Dados atualizados
 * @returns {Promise<object>}
 */
export async function updateCategory(id, categoryData) {

  return fetchAPI(`/category/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
}

/**
 * Deleta uma categoria
 * @param {number} id - ID da categoria
 * @returns {Promise<void>}
 */
export async function deleteCategory(id) {

  return fetchAPI(`/category/delete/${id}`, { method: 'DELETE' });
}

/* ============================================
   Usuário / Configurações
   ============================================ */

//TODO: criar um getUserSettings

/**
 * Atualiza configurações do usuário
 * @param {object} settingsData - Dados de configuração
 * @returns {Promise<object>}
 */
export async function updateUserSettings(settingsData) {
  // PLACEHOLDER: Simula atualização
  // TODO: Substituir por chamada real ao backend
  // return fetchAPI('/user/settings', {
  //   method: 'PUT',
  //   body: JSON.stringify(settingsData),
  // });

  // Atualiza dados locais
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const updatedUser = { ...currentUser, ...settingsData };
  localStorage.setItem('user', JSON.stringify(updatedUser));

  return updatedUser;
}

/**
 * Atualiza a senha do usuário
 * @param {string} currentPassword - Senha atual
 * @param {string} newPassword - Nova senha
 * @returns {Promise<object>}
 */
export async function updatePassword(currentPassword, newPassword) {

  return fetchAPI('/user/password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

}

/* ============================================
   Dashboard / Estatísticas
   ============================================ */

/**
 * Busca resumo financeiro do usuário
 * @returns {Promise<object>}
 */
export async function getFinancialSummary() {

  return fetchAPI('/transaction/dashboard', { method: 'GET' });
}
