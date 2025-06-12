import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchAppointments = createAsyncThunk("calendar/fetchAppointments", async () => {
    const token = localStorage.getItem("token");
    console.log("🔐 Token utilisé :", token); // ✅ Vérification du token

    try {
        const response = await axios.get("http://localhost:5000/admin/appointments", {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("🔍 Réponse API côté Redux :", response.data);

        return response.data.appointments;
    } catch (error) {
        console.error("🚨 Erreur API Redux :", error);
        throw error;
    }
});




//export const fetchAppointments = createAsyncThunk("calendar/fetchAppointments", async () => {
//    console.log("🚀 `fetchAppointments()` lancé depuis Redux !");
//
//    try {
//        const response = await axios.get("http://localhost:5000/appointments", {
//            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
//        });
//
//                console.log("🔍 Réponse API côté Redux :", response.data); // ✅ Voir les données reçues
//        return response.data;
//    } catch (error) {
//        console.error("Erreur lors de la récupération des rendez-vous :", error);
//        throw error;
//    }
//});

const initialState = {
    events: [],
    availableSlots: [],
    status: "idle", // Ajout d'un état pour gérer la requête API
    error: null,
};

const calendarSlice = createSlice({
    name: "calendar",
    initialState,
    reducers: {
        setEvents: (state, action) => { 
            state.events = action.payload;
        },
        setAvailableSlots: (state, action) => { 
            state.availableSlots = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAppointments.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchAppointments.fulfilled, (state, action) => {
                    console.log("📦 Premier rendez-vous exemple:", action.payload[0]);

                    if (!Array.isArray(action.payload)) {
                        console.error("❌ Erreur : La réponse API n'est pas un tableau");
                        return;
                    }

                    state.events = action.payload.map(apt => {
                        if (!apt.start || !apt.end) {
                            console.error("❌ Erreur : Dates manquantes pour le rendez-vous", apt);
                            return null;
                        }
                    
                        const event = {
                            id: apt.id.toString(),
                            title: apt.title || "Rendez-vous sans titre",
                            start: apt.start,
                            end: apt.end,
                            backgroundColor: '#4CAF50',
                            borderColor: '#4CAF50',
                            textColor: '#ffffff',
                            extendedProps: {
                                userId: apt.user_id
                            }
                        };
                    
                        console.log("✨ Événement créé:", event);
                        return event;
                    }).filter(event => event !== null);
                
                    //  Ajout du log ici, après la mise à jour de Redux
                    console.log("✅ Redux mis à jour avec ces rendez-vous :", JSON.stringify(state.events, null, 2));


            })
            .addCase(fetchAppointments.rejected, (state, action) => {
                
                state.status = "failed";
                state.error = action.error.message;
                
            });
            
    },
});

export const { setEvents, setAvailableSlots } = calendarSlice.actions;
export default calendarSlice.reducer;