import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";

// MUI Components
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  Typography,
  IconButton,
  Pagination,
  Box,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
} from "@mui/material";

// MUI Icons
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

const PatientsTable = ({
  patients = [],
  isLoading = false,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onView,
  getStatusColor,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedPatient, setSelectedPatient] = React.useState(null);

  const handleMenuOpen = (event, patient) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPatient(null);
  };

  const handleView = () => {
    if (selectedPatient) {
      if (onView) {
        onView(selectedPatient);
      } else {
        navigate(`/patients/${selectedPatient._id}`);
      }
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedPatient && onEdit) {
      onEdit(selectedPatient);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedPatient && onDelete) {
      onDelete(selectedPatient);
    }
    handleMenuClose();
  };

  return (
    <Card sx={{ mb: 3 }}>
      <Box
        sx={{
          width: "100%",
          maxHeight: "600px",
          overflowX: "auto",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x pan-y",
          "&::-webkit-scrollbar": {
            height: "12px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#e0e0e0",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#1976d2",
            borderRadius: "10px",
            border: "2px solid #e0e0e0",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          },
          scrollbarWidth: "auto",
          scrollbarColor: "#1976d2 #e0e0e0",
        }}
      >
        <Table
          sx={{
            minWidth: 1000,
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell
                sx={{
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  width: 180,
                  position: "sticky",
                  left: 0,
                  backgroundColor: "#f5f5f5",
                  zIndex: 1,
                  borderRight: "2px solid #e0e0e0",
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, whiteSpace: "nowrap", width: 100 }}
              >
                Gender
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, whiteSpace: "nowrap", width: 140 }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, whiteSpace: "nowrap", width: 180 }}
              >
                Doctor
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, whiteSpace: "nowrap", width: 180 }}
              >
                Department
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, whiteSpace: "nowrap", width: 100 }}
              >
                Room
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, whiteSpace: "nowrap", width: 140 }}
              >
                Date Added
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 600, whiteSpace: "nowrap", width: 80 }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography>No patients found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              patients
                .filter((p) => p?._id)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((patient) => (
                  <TableRow key={patient._id} hover>
                    <TableCell
                      sx={{
                        whiteSpace: "nowrap",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "white",
                        zIndex: 1,
                        borderRight: "2px solid #e0e0e0",
                      }}
                    >
                      <Link
                        to={`/patients/${patient._id}`}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                          fontWeight: 500,
                        }}
                      >
                        {patient.name}
                      </Link>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {patient.gender}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Chip
                        label={patient.status}
                        color={getStatusColor ? getStatusColor(patient.status) : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {patient.assignedDoctor
                        ? `Dr. ${patient.assignedDoctor.name}`
                        : "Unassigned"}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {patient.department
                        ? patient.department.name
                        : "Unassigned"}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {patient.roomNumber || "N/A"}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {format(new Date(patient.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, patient)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Scroll Hint for Mobile */}
      {isMobile && (
        <Box
          sx={{
            p: 1,
            backgroundColor: "#e3f2fd",
            borderTop: "1px solid #90caf9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Typography variant="caption" color="primary">
            👈 Swipe left to see more columns
          </Typography>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Pagination Controls */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          p: 2,
          gap: 2,
          borderTop: "1px solid rgba(224, 224, 224, 1)",
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {page * rowsPerPage + 1} to{" "}
            {Math.min((page + 1) * rowsPerPage, patients.length)} of{" "}
            {patients.length} patients
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            gap: 2,
          }}
        >
          <FormControl
            size="small"
            sx={{ minWidth: 120 }}
            fullWidth={isMobile}
          >
            <InputLabel>Rows</InputLabel>
            <Select
              value={rowsPerPage}
              onChange={onRowsPerPageChange}
              label="Rows"
            >
              {[5, 10, 25, 50].map((rows) => (
                <MenuItem key={rows} value={rows}>
                  {rows} per page
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Pagination
            count={Math.ceil(patients.length / rowsPerPage)}
            page={page + 1}
            onChange={(e, newPage) => onPageChange(e, newPage - 1)}
            color="primary"
            showFirstButton
            showLastButton
            size={isMobile ? "small" : "medium"}
          />
        </Box>
      </Box>
    </Card>
  );
};

export default PatientsTable;