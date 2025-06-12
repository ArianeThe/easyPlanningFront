import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { fetchAppointments, setEvents } from "../redux/calendarReducer";
import frLocale from '@fullcalendar/core/locales/fr';
import "../styles/Calendar.css";  // Import du style pour le calendrier

console.log("🚀 `Calendar.jsx` chargé !");

const Calendar = () => {
    const dispatch = useDispatch();
    const reduxEvents = useSelector((state) => state.calendar.events);
    const userRole = useSelector((state) => state.user.role);
    const userId = useSelector((state) => state.user.userInfo?.id);

    // Ancien code commenté
    /*
    const rawEvents = propEvents || reduxEvents;
    const events = rawEvents?.map(event => {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);

        return {
            ...event,
            start: startDate,
            end: endDate,
            allDay: false,
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            textColor: '#ffffff'
        };
    });
    */

    // Nouveau code avec logs détaillés
    console.log("📅 Événements bruts de Redux:", reduxEvents);

    const events = reduxEvents?.map(event => {
        console.log("🔄 Transformation de l'événement:", event);
        
        // Vérification des dates
        if (!event.start || !event.end) {
            console.error("❌ Erreur : Dates manquantes pour l'événement", event);
            return null;
        }

        // Création de l'événement pour FullCalendar
        const calendarEvent = {
            ...event,
            start: event.start,
            end: event.end,
            allDay: false,
            display: 'block'
        };

        console.log("✨ Événement transformé pour FullCalendar:", calendarEvent);
        return calendarEvent;
    }).filter(event => event !== null);

    console.log("🎯 Événements finaux pour FullCalendar:", events);

    useEffect(() => {
        console.log("🔄 Calendar useEffect - Événements actuels:", events);
        dispatch(fetchAppointments());
    }, [dispatch]);

    // Log des événements à chaque rendu
    console.log("📅 Événements dans le composant Calendar:", events);

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
                dispatch(fetchAppointments());
            } catch (error) {
                console.error("Erreur de réservation :", error);
                alert("Impossible de réserver ce créneau.");
            }
        }
    };

    return (
        <div className="calendar-container" style={{ height: '800px', padding: '20px' }}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale={frLocale}
                events={events}
                selectable={true}
                select={handleSelect}
                height="100%"
                slotMinTime="09:45:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                slotDuration="00:45:00"
                eventClick={(info) => {
                    console.log("🎯 Événement cliqué:", info.event);
                    if (info.event.extendedProps?.userId) {
                        window.location.href = `/admin/user/${info.event.extendedProps.userId}`;
                    }
                }}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }}
                displayEventTime={true}
                displayEventEnd={true}
                eventDisplay="block"
                nowIndicator={true}
                weekends={true}
                businessHours={{
                    daysOfWeek: [1, 2, 3, 4, 5],
                    startTime: '09:45',
                    endTime: '20:00',
                }}
                timeZone="local"
                forceEventDuration={true}
                eventOverlap={false}
                slotEventOverlap={false}
                eventConstraint={{
                    startTime: '09:45',
                    endTime: '20:00',
                    dows: [1, 2, 3, 4, 5]
                }}
                dayMaxEvents={true}
                eventMinHeight={20}
                eventMinWidth={20}
                eventMaxStack={1}
                eventOrder="start"
                eventStartEditable={false}
                eventDurationEditable={false}
                slotLabelFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }}
            />
        </div>
    );
};

export default Calendar;
