import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersByRole } from "../../../../features/authSlice.js";
import { Grid, Typography, Paper, List, ListItem, ListItemText } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { usersByRole, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch newly registered users (e.g., role = "public")
    dispatch(fetchUsersByRole("public"));
  }, [dispatch]);

  // Dummy data for charts, staff on holiday, and recent events
  const chartData = [
    { name: "Jan", Patients: 4000, Appointments: 2400 },
    { name: "Feb", Patients: 3000, Appointments: 1398 },
    { name: "Mar", Patients: 2000, Appointments: 9800 },
    { name: "Apr", Patients: 2780, Appointments: 3908 },
    { name: "May", Patients: 1890, Appointments: 4800 },
    { name: "Jun", Patients: 2390, Appointments: 3800 },
  ];

  const staffOnHoliday = [
    { name: "Dr. John Doe", department: "Cardiology" },
    { name: "Dr. Jane Smith", department: "Neurology" },
    { name: "Dr. Alice Johnson", department: "Pediatrics" },
  ];

  const recentEvents = [
    { event: "New Patient Admitted", date: "2023-10-01" },
    { event: "Appointment Scheduled", date: "2023-10-02" },
    { event: "Staff Meeting", date: "2023-10-03" },
  ];

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        {/* Chart Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} style={{ padding: "16px" }}>
            <Typography variant="h6" gutterBottom>
              Patient and Appointment Statistics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Patients" fill="#8884d8" />
                <Bar dataKey="Appointments" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Staff on Holiday Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: "16px" }}>
            <Typography variant="h6" gutterBottom>
              Staff on Holiday
            </Typography>
            <List>
              {staffOnHoliday.map((staff, index) => (
                <ListItem key={index}>
                  <ListItemText primary={staff.name} secondary={staff.department} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Events Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "16px" }}>
            <Typography variant="h6" gutterBottom>
              Recent Events
            </Typography>
            <List>
              {recentEvents.map((event, index) => (
                <ListItem key={index}>
                  <ListItemText primary={event.event} secondary={event.date} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Newly Registered Users Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "16px" }}>
            <Typography variant="h6" gutterBottom>
              Newly Registered Users
            </Typography>
            <List>
              {usersByRole.map((user, index) => (
                <ListItem key={index}>
                  <ListItemText primary={user.name} secondary={user.email} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardPage;