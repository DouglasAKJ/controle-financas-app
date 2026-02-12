import './TransactionCard.css';

export default function TransactionCard({ transaction, onEdit, onDelete }) {
    const { description, valor, tipo, categoria, date } = transaction;
    // Garante que o ID da transação esteja salvo no card como número
    const transactionId = transaction?.id != null ? Number(transaction.id) : undefined;

    const isIncome = tipo === 'ENTRADA';

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';

        // Extrai apenas a parte da data (YYYY-MM-DD) para evitar problemas de timezone
        // Se a string já está no formato YYYY-MM-DD, usa diretamente
        let datePart = dateString;
        if (dateString.includes('T')) {
            datePart = dateString.split('T')[0];
        }

        // Cria uma data local usando apenas a parte da data (sem hora)
        const [year, month, day] = datePart.split('-');
        const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        return localDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
        });
    };

    return (
        <div className="transaction-card">
            <div className="transaction-icon" style={{ backgroundColor: categoria?.color + '20' }}>
                <span style={{ color: categoria?.color }}>
                    {isIncome ? '↗' : '↙'}
                </span>
            </div>

            <div className="transaction-info">
                <h4 className="transaction-description">{description}</h4>
                <div className="transaction-meta">
                    <span
                        className="transaction-category"
                        style={{
                            backgroundColor: categoria?.color + '20',
                            color: categoria?.color
                        }}
                    >
                        {categoria?.categoria || 'Sem categoria'}
                    </span>
                    <span className="transaction-date">{formatDate(date)}</span>
                </div>
            </div>

            <div className="transaction-amount-wrapper">
                <span className={`transaction-amount ${isIncome ? 'income' : 'expense'}`}>
                    {isIncome ? '+' : '-'} {formatCurrency(valor)}
                </span>

                <div className="transaction-actions">
                    {onEdit && (
                        <button
                            className="transaction-action edit"
                            onClick={() => onEdit(transaction)}
                            title="Editar"
                        >
                            ✏️
                        </button>
                    )}
                    {onDelete && (
                        <button
                            className="transaction-action delete"
                            onClick={() => {
                                if (transactionId != null) {
                                    onDelete(transactionId);
                                }
                            }}
                            title="Excluir"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
