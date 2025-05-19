import React, { useState } from "react";
import axios from "axios";

const Login = ({ setUserRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Nettoyage et validation de l'email
    const cleanedEmail = email.trim().toLowerCase();
    
    if (!validateEmail(cleanedEmail)) {
      setErrorMessage("Format d'email invalide");
      return;
    }


    console.log("🔍 Données envoyées :", { email: cleanedEmail, password });


    try {
      console.log("Tentative de connexion avec:", { 
        email: cleanedEmail,
        passwordLength: password.length,
        passwordFirstChar: password[0],
        passwordLastChar: password[password.length - 1]
      });
      const response = await axios.post("http://localhost:5000/login", { 
        email: cleanedEmail, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("🔍 Réponse du serveur complète:", {
        status: response.status,
        headers: response.headers,
        data: response.data
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      setUserRole(response.data.role);
      setErrorMessage("");
    } catch (error) {
      console.error("Détails de l'erreur:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
      setErrorMessage(error.response?.data?.message || "Identifiants incorrects. Veuillez réessayer.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUserRole(null);
  };

  const role = localStorage.getItem("role");

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errorMessage.includes('email') ? 'error' : ''}
          />
        </div>
        <div className="form-group">
          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <button type="submit">Se connecter</button>
      </form>

      {role && <button onClick={handleLogout}>Déconnexion</button>}

      <style jsx>{`
        .login-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        input {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        input.error {
          border-color: red;
        }
        .error-message {
          color: red;
          margin-bottom: 10px;
        }
        button {
          width: 100%;
          padding: 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default Login;
