import "./TransactionCard.css";
export default function TransactionCard({ transaction, onEdit, onDelete }) {
  const { description, valor, tipo, categoria, date } = transaction;
  const transactionId =
    transaction?.id != null ? Number(transaction.id) : undefined;
  const isIncome = tipo === "ENTRADA";
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    let datePart = dateString;
    if (dateString.includes("T")) {
      datePart = dateString.split("T")[0];
    }
    const [year, month, day] = datePart.split("-");
    const localDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
    );
    return localDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };
  return (
    <div className="transaction-card">
      <div
        className="transaction-icon"
        style={{
          backgroundColor: categoria?.color
            ? categoria.color + "20"
            : "#99999920",
        }}
      >
        <span style={{ color: categoria?.color || "#999999" }}>
          {isIncome ? "↗" : "↙"}
        </span>
      </div>
      <div className="transaction-info">
        <h4 className="transaction-description">{description}</h4>
        <div className="transaction-meta">
          <span
            className="transaction-category"
            style={{
              backgroundColor: categoria?.color
                ? categoria.color + "20"
                : "#99999920",
              color: categoria?.color || "#999999",
            }}
          >
            {categoria?.categoria || "Sem categoria"}
          </span>
          <span className="transaction-date">{formatDate(date)}</span>
        </div>
      </div>
      <div className="transaction-amount-wrapper">
        <span
          className={`transaction-amount ${isIncome ? "income" : "expense"}`}
        >
          {isIncome ? "+" : "-"} {formatCurrency(valor)}
        </span>
        <div className="transaction-actions">
          {onEdit && (
            <button
              className="transaction-action edit"
              onClick={() => onEdit(transaction)}
              title="Editar"
            >
              Editar
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
              Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
