import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersByRole } from "../../../../features/authSlice.js";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Fade,
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { usersByRole, loading, error } = useSelector((state) => state.auth);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    dispatch(fetchUsersByRole("public"));
    const timer = setTimeout(() => setShowCards(true), 200);
    return () => clearTimeout(timer);
  }, [dispatch]);

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
    <Box sx={{ p: 2, bgcolor: "#f5f6fa", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 600, color: "#2c3e50", mb: 2 }}
      >
        Dashboard Overview
      </Typography>

      {/* TOP STATISTICS CARD */}
      <Fade in={showCards} timeout={600}>
        <Paper
          elevation={4}
          sx={{
            borderRadius: 2,
            mb: 3,
            p: 2,
            height: { xs: 220, md: 260 },
            bgcolor: "#ffffff",
            boxShadow: "0px 3px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 500 }}>
            Patient & Appointment Statistics
          </Typography>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Patients" fill="#3498db" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Appointments" fill="#2ecc71" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Fade>

      {/* MIDDLE TWO CARDS – SPACING FIXED + Equal Height */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        {/* Staff on Holiday */}
        <Fade in={showCards} timeout={800}>
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              minWidth: 280,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "#ffffff",
              height: 250, // equal height
            }}
          >
            <Typography variant="h6" sx={{ mb: 1.2, fontWeight: 500 }}>
              Staff on Holiday
            </Typography>
            <List dense>
              {staffOnHoliday.map((staff, index) => (
                <ListItem key={index} divider sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={staff.name}
                    secondary={staff.department}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Fade>

        {/* Recent Events */}
        <Fade in={showCards} timeout={1000}>
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              minWidth: 280,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "#ffffff",
              height: 250, // equal height
            }}
          >
            <Typography variant="h6" sx={{ mb: 1.2, fontWeight: 500 }}>
              Recent Events
            </Typography>
            <List dense>
              {recentEvents.map((event, index) => (
                <ListItem key={index} divider sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={event.event}
                    secondary={event.date}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Fade>
      </Box>

      {/* BOTTOM USER LIST — Reduced Padding */}
      <Fade in={showCards} timeout={1200}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            p: 1.5,
            bgcolor: "#ffffff",
            maxWidth: 600,
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1.2, fontWeight: 500 }}>
            Newly Registered Users
          </Typography>

          <List dense>
            {usersByRole.length === 0 ? (
              <Typography sx={{ p: 1, color: "gray" }}>
                No registered users found.
              </Typography>
            ) : (
              usersByRole.map((user) => (
                <ListItem key={user.id} divider sx={{ py: 0.5 }}>
                  <ListItemText primary={user.name} secondary={user.email} />
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      </Fade>
    </Box>
  );
};

export default DashboardPage;
