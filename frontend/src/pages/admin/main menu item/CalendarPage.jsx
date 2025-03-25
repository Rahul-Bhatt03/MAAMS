import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { fetchEvents, addEvent, clearEventError } from "../../../../features/eventSlice";
import { 
  Container, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  TextField,
  Grid,
  Snackbar,
  Alert,
  Fab,
  Box
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const CalendarPage = () => {
    const dispatch = useDispatch();
    const { events = [], status, error } = useSelector((state) => state.events || {});
    
    // State for add event dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: "", severity: "info" });
    const [eventData, setEventData] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        reason: "",
        location: ""
    });

    // Get user info from localStorage
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        dispatch(fetchEvents());
    }, [dispatch]);

    // Show notification when there's an error
    useEffect(() => {
        if (error) {
            setNotification({
                open: true,
                message: error,
                severity: "error"
            });
        }
    }, [error]);

    const handleDateClick = (arg) => {
        if (isAdmin) {
            setSelectedDate(arg.dateStr);
            setEventData({
                ...eventData,
                startDate: arg.dateStr,
                endDate: arg.dateStr
            });
            setOpenDialog(true);
        }
    };

    const handleChange = (e) => {
        setEventData({ ...eventData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        dispatch(addEvent(eventData)).then((result) => {
            if (!result.error) {
                setOpenDialog(false);
                setNotification({
                    open: true,
                    message: "Event created successfully!",
                    severity: "success"
                });
                
                // Reset form
                setEventData({
                    title: "",
                    description: "",
                    startDate: "",
                    endDate: "",
                    reason: "",
                    location: ""
                });
            }
        });
    };

    const closeDialog = () => {
        setOpenDialog(false);
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
        dispatch(clearEventError());
    };

    const openAddEventDialog = () => {
        const today = new Date().toISOString().split('T')[0];
        setEventData({
            ...eventData,
            startDate: today,
            endDate: today
        });
        setOpenDialog(true);
    };

    return (
        <Container sx={{ marginTop: 4, position: "relative", paddingBottom: 10 }}>
            <Typography variant="h4" textAlign="center" mb={3}>Hospital Calendar</Typography>
            
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events.map(event => ({ 
                    title: event.title, 
                    start: event.startDate, 
                    end: event.endDate,
                    extendedProps: {
                        description: event.description,
                        reason: event.reason,
                        location: event.location
                    }
                }))}  
                dateClick={handleDateClick}
                eventClick={(info) => {
                    setNotification({
                        open: true,
                        message: `${info.event.title}: ${info.event.extendedProps.description || 'No description'}`,
                        severity: "info"
                    });
                }}
                height="80vh"
            />
            
            {/* Add Event FAB for admins */}
            {isAdmin && (
                <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
                    <Fab color="primary" aria-label="add" onClick={openAddEventDialog}>
                        <AddIcon />
                    </Fab>
                </Box>
            )}
            
            {/* Add Event Dialog */}
            <Dialog open={openDialog} onClose={closeDialog} fullWidth maxWidth="sm">
                <DialogTitle>Add New Event</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                name="title"
                                value={eventData.title}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={eventData.description}
                                onChange={handleChange}
                                multiline
                                rows={2}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Start Date"
                                type="date"
                                name="startDate"
                                value={eventData.startDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="End Date"
                                type="date"
                                name="endDate"
                                value={eventData.endDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Location"
                                name="location"
                                value={eventData.location}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Reason"
                                name="reason"
                                value={eventData.reason}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color="primary"
                        disabled={!eventData.title || !eventData.startDate || !eventData.endDate}
                    >
                        Add Event
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Notification Snackbar */}
            <Snackbar 
                open={notification.open} 
                autoHideDuration={6000} 
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CalendarPage;