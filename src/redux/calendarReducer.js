import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchAppointments = createAsyncThunk("calendar/fetchAppointments", async () => {
    try {
        const response = await axios.get("http://localhost:5000/appointments", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des rendez-vous :", error);
        throw error;
    }
});

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
                state.status = "succeeded";
                state.events = action.payload;
            })
            .addCase(fetchAppointments.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    },
});

export const { setEvents, setAvailableSlots } = calendarSlice.actions;
export default calendarSlice.reducer;
