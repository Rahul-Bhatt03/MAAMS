import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchEvents, addEvent, softDeleteEvent, updateEvent, clearEventError } from "../../../../features/eventSlice";
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardActions,
  Box,
  Divider,
  CircularProgress
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";

const EventsPage = () => {
    const dispatch = useDispatch();
    const { events = [], status, error } = useSelector((state) => state.events || {});
    const [eventData, setEventData] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        reason: "",
        location: ""
    });
    const [editingEvent, setEditingEvent] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: "", severity: "info" });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, eventId: null });

    // Check user role from localStorage
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

    const handleChange = (e) => {
        setEventData({ ...eventData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingEvent) {
            // Update existing event
            dispatch(updateEvent({ eventId: editingEvent._id, eventData })).then((result) => {
                if (!result.error) {
                    setNotification({
                        open: true,
                        message: "Event updated successfully!",
                        severity: "success"
                    });
                    resetForm();
                }
            });
        } else {
            // Add new event
            dispatch(addEvent(eventData)).then((result) => {
                if (!result.error) {
                    setNotification({
                        open: true,
                        message: "Event created successfully!",
                        severity: "success"
                    });
                    resetForm();
                }
            });
        }
    };

    const handleDelete = (eventId) => {
        setConfirmDialog({ open: true, eventId });
    };

    const confirmDelete = () => {
        dispatch(softDeleteEvent(confirmDialog.eventId)).then((result) => {
            if (!result.error) {
                setNotification({
                    open: true,
                    message: "Event deleted successfully!",
                    severity: "success"
                });
            }
            setConfirmDialog({ open: false, eventId: null });
        });
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setEventData({
            title: event.title,
            description: event.description || "",
            startDate: event.startDate,
            endDate: event.endDate,
            reason: event.reason || "",
            location: event.location || ""
        });
    };

    const resetForm = () => {
        setEventData({
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            reason: "",
            location: ""
        });
        setEditingEvent(null);
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
        dispatch(clearEventError());
    };

    // If user is not admin, redirect or show message
    if (!isAdmin) {
        return (
            <Container sx={{ marginTop: 4, textAlign: "center" }}>
                <Typography variant="h4" mb={3}>Events Management</Typography>
                <Paper sx={{ padding: 4 }}>
                    <Typography>
                        You don't have permission to access this page. Please use the Calendar page to view events.
                    </Typography>
                    <Button 
                        variant="contained" 
                        sx={{ mt: 2 }}
                        href="/calendar"  // Adjust the path as needed
                    >
                        Go to Calendar
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container sx={{ marginTop: 4 }}>
            <Typography variant="h4" textAlign="center" mb={3}>Event Management</Typography>

            {/* Add/Edit Event Form for Admin */}
            <Paper sx={{ padding: 3, marginBottom: 3 }}>
                <Typography variant="h6">
                    {editingEvent ? "Edit Event" : "Add New Event"}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} mt={1}>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="Title" 
                                name="title" 
                                value={eventData.title}
                                onChange={handleChange} 
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
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                label="Reason" 
                                name="reason" 
                                value={eventData.reason}
                                onChange={handleChange} 
                            />
                        </Grid>
                        <Grid item xs={12} display="flex" gap={2} justifyContent="flex-end">
                            {editingEvent && (
                                <Button 
                                    variant="outlined"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary"
                                disabled={!eventData.title || !eventData.startDate || !eventData.endDate}
                            >
                                {editingEvent ? "Update Event" : "Add Event"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Event List */}
            <Typography variant="h6" sx={{ mb: 2 }}>Event List</Typography>
            {status === "loading" ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : events.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="body1">No events found. Create your first event!</Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {events.map(event => (
                        <Grid item xs={12} sm={6} md={4} key={event._id}>
                            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {event.title}
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                                        <Typography variant="body2">
                                            {new Date(event.startDate).toLocaleDateString()} 
                                            {event.endDate && event.endDate !== event.startDate && 
                                                ` - ${new Date(event.endDate).toLocaleDateString()}`}
                                        </Typography>
                                    </Box>
                                    {event.location && (
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                            <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                                            <Typography variant="body2">{event.location}</Typography>
                                        </Box>
                                    )}
                                    {event.description && (
                                        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                                            <DescriptionIcon fontSize="small" sx={{ mr: 1, mt: 0.5 }} />
                                            <Typography variant="body2">{event.description}</Typography>
                                        </Box>
                                    )}
                                    {event.reason && (
                                        <>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Reason:</strong> {event.reason}
                                            </Typography>
                                        </>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <IconButton onClick={() => handleEdit(event)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(event._id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
            
            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, eventId: null })}>
                <DialogTitle>Delete Event</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this event? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, eventId: null })}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
            
            {/* Notifications */}
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

export default EventsPage;