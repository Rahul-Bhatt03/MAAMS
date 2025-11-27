import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from "@mui/material";
import {
  Edit,
  Delete,
  Category as CategoryIcon,
  AttachMoney,
  LocalHospital,
} from "@mui/icons-material";

const ServiceCard = ({
  service,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}) => {
  // Ensure we stop propagation for actions so the card onClick (onView) isn't triggered
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(service);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(service._id, e);
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 3,
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: 6,
        },
        position: "relative",
      }}
      onClick={() => onView(service)}
    >
      {/* Admin Controls - Only visible if isAdmin is true */}
      {isAdmin && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            display: "flex",
            gap: 1,
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: 1,
            p: 0.5,
          }}
          // We don't need a specific onClick stopper here as the individual button handlers do it.
        >
          <Tooltip title="Edit Service">
            <IconButton size="small" color="primary" onClick={handleEditClick}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Service">
            <IconButton size="small" color="error" onClick={handleDeleteClick}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <CardMedia
        component="img"
        height="200"
        image={service.image || "https://via.placeholder.com/300x200?text=Medical+Service"}
        alt={service.name}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {service.name}
        </Typography>

        <Chip
          label={service.category}
          size="small"
          color="primary"
          variant="outlined"
          icon={<CategoryIcon fontSize="small" />}
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {service.description
            ? service.description.slice(0, 100) +
              (service.description.length > 100 ? "..." : "")
            : "No description available"}
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AttachMoney fontSize="small" color="action" />
            <Typography variant="body2" color="textSecondary">
              ${service.pricing || "Varies"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LocalHospital fontSize="small" color="action" />
            <Typography variant="body2" color="textSecondary">
              {service.doctors?.length || 0} Doctor{service.doctors?.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;