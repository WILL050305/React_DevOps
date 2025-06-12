import React from "react";
import NavbarAdmin from "../components/NavbarAdmin";

const Admin = () => {
  const handleLogout = () => {
    alert("Sesión cerrada");
  };

  return (
    <div style={{ display: "flex" }}>
      <NavbarAdmin onLogout={handleLogout} />
      <main style={{ marginLeft: "240px", padding: "2rem", width: "100%" }}>
        {/* Puedes dejar este espacio para renderizar contenido dinámico si es necesario */}
      </main>
    </div>
  );
};

export default Admin;