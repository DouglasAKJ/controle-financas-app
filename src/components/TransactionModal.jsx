import { useState, useEffect } from 'react';
import './TransactionModal.css';

export default function TransactionModal({
    isOpen,
    onClose,
    onSubmit,
    categories = [],
    transaction = null
}) {
    const [formData, setFormData] = useState({
        valor: '',
        categoria: '',
        tipo: '', // ENTRADA ou SAIDA
        data: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (transaction) {
            // Formata a data para o formato do input (YYYY-MM-DD)
            // Extrai apenas a parte da data para evitar problemas de timezone
            let transactionDate = '';
            if (transaction.date) {
                if (transaction.date.includes('T')) {
                    // Se tem hora, extrai apenas a data
                    transactionDate = transaction.date.split('T')[0];
                } else {
                    // Se já está no formato YYYY-MM-DD, usa diretamente
                    transactionDate = transaction.date;
                }
            }

            setFormData({
                valor: transaction.amount?.toString() || '',
                categoria: transaction.category?.id?.toString() || '',
                tipo: transaction.tipo || '',
                data: transactionDate
            });
        } else {
            // Define data padrão como hoje quando criar nova transação
            // Usa data local para evitar problemas de timezone
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            setFormData({
                valor: '',
                categoria: '',
                tipo: '',
                data: todayStr
            });
        }
        setErrors({});
    }, [transaction, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Limpa erro do campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleTipoChange = (tipo) => {
        setFormData(prev => ({ ...prev, tipo }));
        if (errors.tipo) {
            setErrors(prev => ({ ...prev, tipo: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.tipo || (formData.tipo !== 'ENTRADA' && formData.tipo !== 'SAIDA')) {
            newErrors.tipo = 'Selecione se é uma entrada ou saída';
        }

        if (!formData.valor || parseFloat(formData.valor) <= 0) {
            newErrors.valor = 'Valor deve ser maior que zero';
        }

        if (!formData.categoria) {
            newErrors.categoria = 'Categoria é obrigatória';
        }

        if (!formData.data) {
            newErrors.data = 'Data é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {

            // Deriva os dados implícitos
            // Converte a data do formulário (YYYY-MM-DD) para ISO string
            // Usa meia-noite UTC para garantir que a data seja preservada corretamente
            let dateISO;
            if (formData.data) {
                // Envia como meia-noite UTC para preservar a data exata
                dateISO = `${formData.data}T00:00:00.000Z`;
            } else {
                dateISO = new Date().toISOString();
            }

            const submissionData = {
                valor: parseFloat(formData.valor),
                tipoTransacao: formData.tipo,
                categoriaId: parseInt(formData.categoria),
                date: dateISO,
            };

            await onSubmit(submissionData);

            onClose();
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {transaction ? 'Editar Transação' : 'Nova Transação'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Tipo de Transação */}
                    <div className="form-group">
                        <label className="form-label">Tipo de Transação</label>
                        <div className="transaction-type-selector">
                            <button
                                type="button"
                                className={`type-btn income ${formData.tipo === 'ENTRADA' ? 'active' : ''}`}
                                onClick={() => handleTipoChange('ENTRADA')}
                            >
                                Entrada
                            </button>
                            <button
                                type="button"
                                className={`type-btn expense ${formData.tipo === 'SAIDA' ? 'active' : ''}`}
                                onClick={() => handleTipoChange('SAIDA')}
                            >
                                Saída
                            </button>
                        </div>
                        {errors.tipo && (
                            <span className="form-error">{errors.tipo}</span>
                        )}
                    </div>

                    {/* Valor */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="valor">Valor (R$)</label>
                        <input
                            type="number"
                            id="valor"
                            name="valor"
                            className={`form-input ${errors.valor ? 'error' : ''}`}
                            value={formData.valor}
                            onChange={handleChange}
                            placeholder="0,00"
                            step="0.01"
                            min="0"
                        />
                        {errors.valor && (
                            <span className="form-error">{errors.valor}</span>
                        )}
                    </div>

                    {/* Categoria */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="categoria">Categoria</label>
                        <select
                            id="categoria"
                            name="categoria"
                            className={`form-select ${errors.categoria ? 'error' : ''}`}
                            value={formData.categoria}
                            onChange={handleChange}
                        >
                            <option value="">Selecione uma categoria</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.categoria}
                                </option>
                            ))}
                        </select>
                        {errors.categoria && (
                            <span className="form-error">{errors.categoria}</span>
                        )}
                    </div>

                    {/* Data */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="data">Data</label>
                        <input
                            type="date"
                            id="data"
                            name="data"
                            className={`form-input ${errors.data ? 'error' : ''}`}
                            value={formData.data}
                            onChange={handleChange}
                        />
                        {errors.data && (
                            <span className="form-error">{errors.data}</span>
                        )}
                    </div>

                    {/* Erro geral */}
                    {errors.submit && (
                        <div className="form-error-box">{errors.submit}</div>
                    )}

                    {/* Botões */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : (transaction ? 'Atualizar' : 'Adicionar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
