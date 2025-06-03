import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/userReducer';
import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [users, setUsers] = useState([]);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [slotDuration, setSlotDuration] = useState(45);
    const [slotStartTime, setSlotStartTime] = useState('');
    const [slotEndTime, setSlotEndTime] = useState('');
    const [slotDate, setSlotDate] = useState('');
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        fetchSlots();
        fetchAppointments();
        fetchUsers();
    }, []);

    const fetchSlots = async () => {
        try {
            const response = await axios.get('http://localhost:5000/slots', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSlots(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des créneaux:', error);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:5000/appointments', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log("Rendez-vous reçus:", response.data);
            setAppointments(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des rendez-vous:', error);
        }
    };

   const fetchUsers = async () => {
    try {
        const response = await axios.get("http://localhost:5000/admin/users", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        console.log("✅ Utilisateurs reçus :", response.data.users);
        setUsers(response.data.users);
    } catch (error) {
        console.error("🚨 Erreur lors de la récupération des utilisateurs :", error);
    }
};


    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const handleEventClick = async (info) => {
        const eventId = info.event.id;
        if (eventId.startsWith('apt-')) {
            const appointmentId = parseInt(eventId.split('-')[1]);
            const appointment = appointments.find(a => a.id === appointmentId);
            if (appointment) {
                const user = users.find(u => u.id === appointment.user_id);
                if (user) {
                    setSelectedUser(user);
                    setShowUserModal(true);
                }
            }
        }
    };

        const handleUserClick = (user) => {
        console.log("Utilisateur sélectionné :", user);
        setSelectedUser(user);
        setShowUserModal(true);
    };

        const handleDocumentShare = (user) => {
        console.log("Partage de document avec :", user);
        setSelectedUser(user);
        setShowDocumentModal(true);
    };



    const events = [
        ...appointments.map(apt => {
            console.log("Traitement du rendez-vous:", apt);
            return {
                id: `apt-${apt.id}`,
                title: `${apt.title} - ${apt.first_name} ${apt.last_name}`,
                start: new Date(apt.start_time).toISOString(),
                end: new Date(apt.end_time).toISOString(),
                backgroundColor: '#4CAF50',
                borderColor: '#4CAF50',
                extendedProps: { type: 'appointment' }
            };
        })
    ];

    console.log("Événements du calendrier:", events);

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Tableau de bord administrateur</h1>
                <button onClick={handleLogout} className="logout-button">Déconnexion</button>
            </div>

            <div className="dashboard-content">
                <div className="calendar-section">
                    <h2>Calendrier des rendez-vous</h2>
                    <Calendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        locale={frLocale}
                        events={events}
                        eventClick={handleEventClick}
                        height="auto"
                        slotMinTime="08:00:00"
                        slotMaxTime="20:00:00"
                        allDaySlot={false}
                        slotDuration="00:45:00"
                    />
                </div>

                <div className="users-section">
    <h2>Liste des utilisateurs</h2>
    {users.length === 0 ? (
        <p>Aucun utilisateur enregistré</p>
    ) : (
        <div className="users-list">
            {users.map(user => (
                <div key={user.id} className="user-card">
                    <div className="user-info">
                        <h3>{user.first_name} {user.last_name}</h3>
                        <p>Email: {user.email}</p>
                        <p>Téléphone: {user.phone || 'Non renseigné'}</p>
                    </div>
                    
                    <button 
                        className="view-profile-button"
                        onClick={() => handleUserClick(user)}
                    >
                        Voir le profil
                    </button>

                    <button 
                        className="share-document-button"
                        onClick={() => handleDocumentShare(user)}
                    >
                        Partager un document
                    </button>
                </div>
            ))}
        </div>
    )}
</div>

            </div>

            {showUserModal && selectedUser && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Profil utilisateur</h2>
                        <div className="user-profile">
                            <p><strong>Nom:</strong> {selectedUser.last_name}</p>
                            <p><strong>Prénom:</strong> {selectedUser.first_name}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Téléphone:</strong> {selectedUser.phone || 'Non renseigné'}</p>
                            <p><strong>Adresse:</strong> {selectedUser.address || 'Non renseignée'}</p>
                            <p><strong>Date de naissance:</strong> {selectedUser.birth_date ? new Date(selectedUser.birth_date).toLocaleDateString('fr-FR') : 'Non renseignée'}</p>
                            <p><strong>Notifications:</strong> {selectedUser.notifications_enabled ? 'Activées' : 'Désactivées'}</p>
                        </div>
                        <div className="modal-buttons">
                            <button onClick={() => setShowUserModal(false)}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard; 