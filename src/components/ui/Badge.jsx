// Props: text (string), color ("pendiente" | "listo" | "facturado" | custom)

import "./Badge.css";

const Badge = ({ text, color }) => {
  return (
    <span className={`badge badge--${color}`}>
      {text}
    </span>
  );
};

export default Badge;
