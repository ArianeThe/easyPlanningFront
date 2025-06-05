import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();



    useEffect(() => {
        // Récupérer les infos de l'utilisateur
        axios.get(`http://localhost:5000/admin/user/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(response => setUser(response.data))
        .catch(error => console.error("Erreur récupération utilisateur :", error));

        // Récupérer les rendez-vous liés à cet utilisateur
        axios.get(`http://localhost:5000/admin/user/${userId}/appointments`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(response => setAppointments(response.data))
        .catch(error => console.error("Erreur récupération rendez-vous :", error));
    }, [userId]);

    return (
        <div>
            {user ? (
                <>
                    <h1>Profil de {user.first_name} {user.last_name}</h1>
                    <h2>Historique des rendez-vous</h2>
                    <ul>
                        {appointments.map(apt => (
                            <li key={apt.id}>
                                {apt.title} - {new Date(apt.start_time).toLocaleString()} → {new Date(apt.end_time).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <p>Chargement des données...</p>
            )}
            <button onClick={() => navigate("/admin")} style={{ marginBottom: "20px" }}>
                Retour au Tableau de Bord
            </button>
        </div>
    );
};

export default UserProfile;
