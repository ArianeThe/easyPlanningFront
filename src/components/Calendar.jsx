import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

const Calendar = () => {
  const [events, setEvents] = useState([]);

  // Récupérer les rendez-vous depuis l’API backend
useEffect(() => {
  const token = localStorage.getItem("token"); // Récupérer le token JWT

  console.log("Token récupéré :", token); // Vérifier la présence du token


    if (!token) {
    console.error("Erreur : Aucun token trouvé !");
    return; // Arrêter la requête si pas de token
  }

  axios.get("http://localhost:5000/appointments", {
    headers: { Authorization: `Bearer ${token}` }  //  Ajouter le token JWT
  })
  .then(response => {
    const formattedEvents = response.data.map(event => ({
      title: event.title,
      start: event.start,
      end: event.end,
    }));
    setEvents(formattedEvents);
  })
  .catch(error => console.error("Erreur :", error));
}, []);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek" // Vue en semaine comme Doctolib
      events={events} // Affichage des rendez-vous
    />
  );
};

export default Calendar;
