import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux"; // Utilisation de Redux

const UserHome = () => {
    const userRole = useSelector((state) => state.user.role); // Récupération du rôle depuis Redux
    const [appointments, setAppointments] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    console.log(" UserHome.jsx chargé correctement !");
    console.log(" Rôle actuel dans Redux :", userRole);

    //  Récupérer les rendez-vous
    useEffect(() => {
        fetch("http://localhost:5000/appointments", {
            method: "GET",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
        .then(res => res.json())
        .then(data => {
            console.log(" Rendez-vous reçus :", data);
            setAppointments(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error("❌ Erreur récupération des rendez-vous :", err));
    }, []);

    //  Récupérer les créneaux libres
    useEffect(() => {
        fetch("http://localhost:5000/available-slots", {
            method: "GET",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
        .then(res => res.json())
        .then(data => {
            console.log(" Créneaux libres reçus :", data);
            setAvailableSlots(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error(" Erreur récupération créneaux :", err));
    }, []);

    //  Modifier ses informations
    const handleUpdateUser = () => {
        fetch("http://localhost:5000/user", {
            method: "PUT",
            headers: { 
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        })
        .then(res => res.json())
        .then(data => console.log(" Mise à jour réussie :", data))
        .catch(err => console.error(" Erreur mise à jour profil :", err));
    };

    return (
        <div>
            <h2> Bienvenue sur votre calendrier</h2>
            <p>Vous pouvez consulter vos rendez-vous et réserver des créneaux disponibles.</p>

            {/*  Liste des rendez-vous */}
            <h3> Vos rendez-vous :</h3>
            <ul>
                {appointments.length > 0 ? (
                    appointments.map((appt, index) => (
                        <li key={index}>{appt.start_time} - {appt.end_time} ({appt.status})</li>
                    ))
                ) : (
                    <li> Aucun rendez-vous trouvé</li>
                )}
            </ul>

            {/*  Créneaux disponibles */}
            <h3> Créneaux disponibles :</h3>
            <ul>
                {availableSlots.length > 0 ? (
                    availableSlots.map((slot, index) => (
                        <li key={index}>{slot.start_time} - {slot.end_time} <button>Réserver</button></li>
                    ))
                ) : (
                    <li> Aucun créneau disponible</li>
                )}
            </ul>

            {/*  Modifier ses informations */}
            <h3> Modifier vos informations :</h3>
            <input type="email" placeholder="Nouveau Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Nouveau Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleUpdateUser}>Mettre à jour</button>
        </div>
    );
};

export default UserHome;
