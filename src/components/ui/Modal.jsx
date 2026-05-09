// Modal.jsx — Componente compartido (acordar props con Facu)
// Props: isOpen, onClose, onConfirm, title, body, confirmLabel, danger

import "./Modal.css";

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = "Confirmar",
  danger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="modal__body">{body}</div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className={`btn ${danger ? "btn--danger" : "btn--primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
