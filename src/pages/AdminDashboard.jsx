import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [slotConfig, setSlotConfig] = useState({
        start_date: '',
        end_date: '',
        duration_minutes: 30,
        start_hour: 9,
        end_hour: 17
    });
    const [documentData, setDocumentData] = useState({
        user_id: '',
        document_url: '',
        document_name: ''
    });
    const navigate = useNavigate();
    const userInfo = useSelector(state => state.user.userInfo);

    useEffect(() => {
        fetchAppointments();
        fetchUsers();
    }, []);

const fetchAppointments = async () => {
    try {
        const response = await axios.get('http://localhost:5000/admin/appointments', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        setAppointments(response.data.appointments); // ✅ Ajout de `.appointments`
    } catch (error) {
        console.error('🚨 Erreur lors de la récupération des rendez-vous:', error);
    }
};


    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/admin/users', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
        }
    };

    const handleCreateSlots = async () => {
        try {
            await axios.post('http://localhost:5000/admin/slots', slotConfig, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setShowSlotModal(false);
            fetchAppointments();
        } catch (error) {
            console.error('Erreur lors de la création des créneaux:', error);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        try {
            await axios.delete(`http://localhost:5000/appointments/${appointmentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchAppointments();
        } catch (error) {
            console.error('Erreur lors de l\'annulation du rendez-vous:', error);
        }
    };

    const handleViewUser = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSelectedUser(response.data);
            setShowUserModal(true);
        } catch (error) {
            console.error('Erreur lors de la récupération des informations utilisateur:', error);
        }
    };

    const handleShareDocument = async () => {
        try {
            await axios.post('http://localhost:5000/admin/documents', documentData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setShowDocumentModal(false);
            setDocumentData({ user_id: '', document_url: '', document_name: '' });
            if (selectedUser) {
                handleViewUser(selectedUser.id);
            }
        } catch (error) {
            console.error('Erreur lors du partage du document:', error);
        }
    };

    const events = appointments.map(apt => ({
        id: apt.id,
        title: `${apt.title} - ${apt.first_name} ${apt.last_name}`,
        start: apt.start_time,
        end: apt.end_time,
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50'
    }));

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login"; // Redirige vers la page de connexion
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Tableau de bord administrateur</h1>
                <div className="admin-actions">
                    <button onClick={() => setShowSlotModal(true)}>
                        Créer des créneaux
                    </button>
                
                    <button onClick={handleLogout} className="logout-button">
                        Déconnexion
                        </button>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="calendar-section">
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
                        eventClick={(info) => {
                            const appointment = appointments.find(apt => apt.id === parseInt(info.event.id));
                            if (appointment) {
                                handleViewUser(appointment.user_id);
                            }
                        }}
                        height="auto"
                    />
                </div>

                <div className="users-section">
                    <h2>Utilisateurs</h2>
                    <div className="users-list">
                        {users.map(user => (
                            <div key={user.id} className="user-card">
                                <h3>{user.first_name} {user.last_name}</h3>
                                <p>Email: {user.email}</p>
                                <div className="user-actions">
                                    <button onClick={() => handleViewUser(user.id)}>
                                        Voir détails
                                    </button>
                                    <button onClick={() => {
                                        setDocumentData({ ...documentData, user_id: user.id });
                                        setShowDocumentModal(true);
                                    }}>
                                        Partager document
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showSlotModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Créer des créneaux</h2>
                        <div className="form-group">
                            <label>Date de début:</label>
                            <input
                                type="date"
                                value={slotConfig.start_date}
                                onChange={(e) => setSlotConfig({ ...slotConfig, start_date: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date de fin:</label>
                            <input
                                type="date"
                                value={slotConfig.end_date}
                                onChange={(e) => setSlotConfig({ ...slotConfig, end_date: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Durée (minutes):</label>
                            <input
                                type="number"
                                value={slotConfig.duration_minutes}
                                onChange={(e) => setSlotConfig({ ...slotConfig, duration_minutes: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Heure de début:</label>
                            <input
                                type="number"
                                value={slotConfig.start_hour}
                                onChange={(e) => setSlotConfig({ ...slotConfig, start_hour: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Heure de fin:</label>
                            <input
                                type="number"
                                value={slotConfig.end_hour}
                                onChange={(e) => setSlotConfig({ ...slotConfig, end_hour: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="modal-buttons">
                            <button onClick={handleCreateSlots}>Créer</button>
                            <button onClick={() => setShowSlotModal(false)}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}

            {showUserModal && selectedUser && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Détails utilisateur</h2>
                        <div className="user-details">
                            <p><strong>Nom:</strong> {selectedUser.first_name} {selectedUser.last_name}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Téléphone:</strong> {selectedUser.phone || 'Non renseigné'}</p>
                            <p><strong>Adresse:</strong> {selectedUser.address || 'Non renseignée'}</p>
                            <p><strong>Notifications:</strong> {selectedUser.notifications_enabled ? 'Activées' : 'Désactivées'}</p>
                            
                            {selectedUser.shared_documents && (
                                <div className="shared-documents">
                                    <h3>Documents partagés</h3>
                                    {JSON.parse(selectedUser.shared_documents).map((doc, index) => (
                                        <div key={index} className="document-item">
                                            <p>{doc.name}</p>
                                            <p>Partagé le: {new Date(doc.shared_at).toLocaleDateString()}</p>
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                Télécharger
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-buttons">
                            <button onClick={() => {
                                setDocumentData({ ...documentData, user_id: selectedUser.id });
                                setShowDocumentModal(true);
                            }}>
                                Partager un document
                            </button>
                            <button onClick={() => setShowUserModal(false)}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            {showDocumentModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Partager un document</h2>
                        <div className="form-group">
                            <label>Nom du document:</label>
                            <input
                                type="text"
                                value={documentData.document_name}
                                onChange={(e) => setDocumentData({ ...documentData, document_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>URL du document:</label>
                            <input
                                type="text"
                                value={documentData.document_url}
                                onChange={(e) => setDocumentData({ ...documentData, document_url: e.target.value })}
                            />
                        </div>
                        <div className="modal-buttons">
                            <button onClick={handleShareDocument}>Partager</button>
                            <button onClick={() => setShowDocumentModal(false)}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard; 