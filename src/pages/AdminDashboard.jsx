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
    const [appointments, setAppointments] = useState([]);
    const [users, setUsers] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/admin/appointments', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log("Rendez-vous reçus:", response.data);
            setAppointments(response.data.appointments || []);
        } catch (error) {
            console.error('Erreur lors de la récupération des rendez-vous:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/admin/users', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log("Utilisateurs reçus:", response.data);
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchAppointments();
        fetchUsers();
    }, [navigate]);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

   const handleEventClick = async (info) => {
    const eventId = info.event.id;
    console.log("Événement cliqué, ID :", eventId);

    if (eventId.startsWith('apt-')) {
        const appointmentId = parseInt(eventId.split('-')[1]);
        const appointment = appointments.find(a => a.id === appointmentId);
        
        console.log("Détails du rendez-vous :", appointment);

        if (appointment) {
             console.log("Liste des utilisateurs :", users); // Vérifie ce que contient users
            const user = users.find(u => `${u.first_name} ${u.last_name}` === appointment.user); 
            console.log("Utilisateur trouvé :", user);

            if (user) {
                setSelectedUser(user);
                setShowUserModal(true);
            }
        }
    }
};


    const handleUserSelect = (event) => {
        const userId = parseInt(event.target.value);
        if (userId) {
            const user = users.find(u => u.id === userId);
            if (user) {
                setSelectedUser(user);
                setShowUserModal(true);
            }
        }
    };


        console.log("Liste des rendez-vous :", appointments);

    const events = appointments.map((apt) => ({
    id: `apt-${apt.id}`,
    title: `${apt.title} - ${apt.user}`, // Nom correctement récupéré
    start: new Date(apt.start).toISOString(),
    end: new Date(apt.end).toISOString(),
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    extendedProps: { type: 'appointment' }
}));

    console.log("Événements formatés pour affichage :", events);


    

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
                    <select 
                        className="user-select"
                        onChange={handleUserSelect}
                        defaultValue=""
                    >
                        <option value="" disabled>Sélectionner un utilisateur</option>
                        {Array.isArray(users) && users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                            </option>
                        ))}
                    </select>
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