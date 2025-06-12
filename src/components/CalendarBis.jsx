import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { fetchAppointments } from "../redux/calendarReducer";
import frLocale from '@fullcalendar/core/locales/fr';

/**
 * Version simplifiée du composant Calendar pour comprendre la logique
 * Ce composant n'est pas destiné à être utilisé en production
 * Il sert uniquement à comprendre le fonctionnement de FullCalendar
 */
const CalendarBis = () => {
    const dispatch = useDispatch();
    const userRole = useSelector((state) => state.user.role);
    const userId = useSelector((state) => state.user.userInfo?.id);
    const appointments = useSelector((state) => state.calendar.appointments);

    useEffect(() => {
        console.log("📅 Rendez-vous dans Redux:", appointments);
        dispatch(fetchAppointments());
    }, [dispatch]);

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

    // Transformation directe des événements
    const transformedEvents = Array.isArray(appointments) ? appointments.map(event => {
        console.log("🔄 Transformation de l'événement:", event);
        return {
            id: event.id.toString(),
            title: event.title,
            start: event.start,
            end: event.end,
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            textColor: '#ffffff',
            extendedProps: {
                userId: event.user_id
            }
        };
    }) : [];

    console.log("✨ Événements transformés:", transformedEvents);

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
                events={transformedEvents}
                selectable={true}
                select={handleSelect}
                height="100%"
                slotMinTime="09:45:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                slotDuration="00:45:00"
                eventClick={(info) => {
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
                eventDidMount={(info) => {
                    console.log("🎯 Événement monté:", info.event);
                    info.el.style.backgroundColor = '#4CAF50';
                    info.el.style.borderColor = '#4CAF50';
                    info.el.style.color = '#ffffff';
                    info.el.style.padding = '5px';
                    info.el.style.borderRadius = '4px';
                }}
                eventContent={(info) => ({
                    html: `
                        <div style="padding: 5px;">
                            <strong>${info.event.title}</strong>
                            <br/>
                            ${info.timeText}
                        </div>
                    `
                })}
            />
        </div>
    );
};

export default CalendarBis; 