import React, { useState } from "react";
import Login from "./pages/Login";
import Calendar from "./components/Calendar";

const App = () => {
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || null);

  const handleLogout = () => {
    localStorage.removeItem("token"); //  Supprime le token JWT
    localStorage.removeItem("role"); //  Supprime le rôle
    setUserRole(null); //  Réinitialise l’état
  };

  return (
    <div className="App">
      {!userRole ? (
        <Login setUserRole={setUserRole} />
      ) : (
        <div>
          <h1>Bienvenue {userRole === "admin" ? "Administrateur" : "Utilisateur"}</h1>
          <button onClick={handleLogout}>Déconnexion</button> {/*  Ajout du bouton */}
          {userRole === "admin" ? (
            <button>Gérer les créneaux</button>
          ) : (
            <Calendar />
          )}
        </div>
      )}
    </div>
  );
};

export default App;
