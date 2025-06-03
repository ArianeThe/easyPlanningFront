import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";  // Import Redux
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { fetchAppointments, setEvents } from "../redux/calendarReducer";  // Import des actions Redux

const Calendar = () => {
    const dispatch = useDispatch();
    const events = useSelector((state) => state.calendar.events);  //  Accès aux événements via Redux
    const userRole = useSelector((state) => state.user.role);  //  Accès au rôle via Redux
    const userId = useSelector((state) => state.user.userInfo?.id);  //  Accès à l’ID utilisateur via Redux

    // Récupérer les rendez-vous depuis l’API via Redux
    useEffect(() => {
        dispatch(fetchAppointments());  //  Charge les rendez-vous globalement
    }, [dispatch]);

    // Réserver un créneau libre
    const handleSelect = async (info) => {
        if (userRole !== "admin") {
            try {
                await axios.post("http://localhost:5000/book-appointment", { 
                    userId, 
                    start: info.startStr, 
                    end: info.endStr 
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });

                alert(`Créneau réservé pour ${info.startStr} !`);

                //  Mettre à jour Redux après réservation
                dispatch(setEvents([...events, {
                    title: "Votre RDV",
                    start: info.startStr,
                    end: info.endStr,
                    userId: userId,
                    color: "blue",
                }]));
            } catch (error) {
                console.error("Erreur de réservation :", error);
                alert("Impossible de réserver ce créneau.");
            }
        }
    };

    return (
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={events}
            selectable={true}
            select={handleSelect}
        />
    );
};

export default Calendar;
