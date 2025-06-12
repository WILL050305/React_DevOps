import React from "react";

const linkStyle = {
  color: "#fff",
  display: "block",
  margin: "1rem 0",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  textDecoration: "none",
  transition: "background 0.3s, color 0.3s"
};

const NavbarAdmin = ({ onLogout }) => (
  <aside style={{
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "240px",
    background: "#222",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "2rem 1rem",
    zIndex: 1000
  }}>
    <h2 style={{ marginBottom: "2rem", fontSize: "1.3rem" }}>Panel Admin</h2>
    <nav style={{ flex: 1 }}>
      <a
        href="#productos"
        style={linkStyle}
        className="nav-admin-link"
      >
        Gestión de Productos
      </a>
      <a
        href="#estadisticas"
        style={linkStyle}
        className="nav-admin-link"
      >
        Estadísticas y Reportes
      </a>
      <a
        href="#promociones"
        style={linkStyle}
        className="nav-admin-link"
      >
        Promociones y Marketing
      </a>
    </nav>
    <button onClick={onLogout} style={{
      background: "#e74c3c",
      color: "#fff",
      border: "none",
      padding: "0.7rem 1rem",
      borderRadius: "4px",
      cursor: "pointer",
      marginTop: "2rem"
    }}>
      Cerrar sesión
    </button>
    {/* Animación CSS */}
    <style>
      {`
        .nav-admin-link:hover {
          background: #444;
          color: #ffd700;
          transform: translateX(8px) scale(1.05);
          transition: background 0.3s, color 0.3s, transform 0.3s;
        }
      `}
    </style>
  </aside>
);

export default NavbarAdmin;