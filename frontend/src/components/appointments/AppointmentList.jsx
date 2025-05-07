import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchUserAppointments,
  fetchDoctorAppointments,
  deleteAppointment,
  updateAppointmentStatus
} from '../features/appointmentSlice';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import { format, parseISO } from 'date-fns';

const AppointmentsList = () => {
  const dispatch = useDispatch();
  const { userAppointments, doctorAppointments, loading } = useSelector((state) => state.appointment);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchUserAppointments());
    if (user?.role === 'doctor') {
      dispatch(fetchDoctorAppointments(user.doctorId));
    }
  }, [dispatch, user]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      dispatch(deleteAppointment(id));
    }
  };

  const handleStatusUpdate = (id, status) => {
    dispatch(updateAppointmentStatus({ id, status }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Cancelled':
        return 'error';
      case 'Completed':
        return 'info';
      default:
        return 'warning';
    }
  };

  return (
    <Box>
      {/* User Appointments */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            My Appointments
          </Typography>
          
          {loading ? (
            <CircularProgress />
          ) : userAppointments.length > 0 ? (
            <Paper sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userAppointments.map((appointment) => (
                    <TableRow key={appointment._id}>
                      <TableCell>
                        {format(parseISO(appointment.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{appointment.timeSlot}</TableCell>
                      <TableCell>
                        {appointment.department?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {appointment.doctor?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={appointment.status}
                          color={getStatusColor(appointment.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDelete(appointment._id)}
                          disabled={appointment.status === 'Completed'}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          ) : (
            <Typography variant="body1" color="textSecondary">
              No appointments found
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Doctor Appointments (for doctors) */}
      {user?.role === 'doctor' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              My Doctor Appointments
            </Typography>
            
            {loading ? (
              <CircularProgress />
            ) : doctorAppointments.length > 0 ? (
              <Paper sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {doctorAppointments.map((appointment) => (
                      <TableRow key={appointment._id}>
                        <TableCell>
                          {format(parseISO(appointment.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{appointment.timeSlot}</TableCell>
                        <TableCell>
                          {appointment.patientName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {appointment.department?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={appointment.status}
                            color={getStatusColor(appointment.status)}
                          />
                        </TableCell>
                        <TableCell>
                          {appointment.status === 'Pending' && (
                            <>
                              <Button
                                size="small"
                                color="success"
                                onClick={() => handleStatusUpdate(appointment._id, 'Confirmed')}
                                sx={{ mr: 1 }}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleStatusUpdate(appointment._id, 'Cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {appointment.status === 'Confirmed' && (
                            <Button
                              size="small"
                              color="primary"
                              onClick={() => handleStatusUpdate(appointment._id, 'Completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            ) : (
              <Typography variant="body1" color="textSecondary">
                No appointments found
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AppointmentsList;