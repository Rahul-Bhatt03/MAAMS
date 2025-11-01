import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// MUI Components
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  Box,
  IconButton,
} from "@mui/material";

// MUI Icons
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const DepartmentCard = ({ 
  department, 
  onEdit, 
  onDelete,
  showAdminActions = false 
}) => {
  const navigate = useNavigate();
  
  // Check user role from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = ["admin", "superadmin", "groupadmin"].includes(user.role);

  const handleCardClick = () => {
    navigate(`/department/${department._id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(department);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(department._id);
  };

  return (
    <Card
      sx={{
        height: "100%",
        width : 336 ,
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea onClick={handleCardClick}>
        <CardMedia
          component="img"
         
          height="140"
          image={
            department.imageUrl || 
            department.image ||
            "https://via.placeholder.com/300x140?text=Department"
          }
          alt={department.name}
          sx={{ objectFit: "cover" }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1,
            }}
          >
            <Typography gutterBottom variant="h5" component="div" sx={{ mb: 0 }}>
              {department.name}
            </Typography>
            {showAdminActions && isAdmin && (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleEditClick}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={handleDeleteClick}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {department.description.length > 100
              ? `${department.description.substring(0, 100)}...`
              : department.description}
          </Typography>
          
          <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
            <strong>Hours:</strong> {department.timings}
          </Typography>
          
          {department.services && department.services.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Services:</strong>
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {department.services
                  .slice(0, 3)
                  .map((service, index) => (
                    <Chip 
                      key={index} 
                      label={typeof service === 'object' ? service.name : service} 
                      size="small" 
                    />
                  ))}
                {department.services.length > 3 && (
                  <Chip
                    label={`+${department.services.length - 3} more`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DepartmentCard;