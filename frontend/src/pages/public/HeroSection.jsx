import React, { useState } from "react";
import { Box, Typography, Button, Slide, Paper, IconButton } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [openChat, setOpenChat] = useState(false);
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: "100vw",
        height: "60vh",
        display: "flex",
        flexDirection: "column",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Video Section (50% of screen) */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <video
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src="/hero-section-vdeo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Text and CTA Button Inside Video */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            textAlign: "center",
            width: "100%",
          }}
        >
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{ fontSize: { xs: "2rem", md: "3.5rem" } }}
          >
            Welcome to Our Hospital
          </Typography>
          <Typography
            variant="h6"
            sx={{ mt: 1, fontSize: { xs: "1rem", md: "1.2rem" } }}
          >
            Providing Quality Healthcare Services 24/7
          </Typography>
          {/* CTA Button */}
          <Button
            variant="contained"
            color="primary"
            sx={{
              mt: 3,
              fontSize: { xs: "0.9rem", md: "1rem" },
              padding: { xs: "8px 16px", md: "10px 20px" },
              borderRadius: "5px",
              textTransform: "none",
            }}
            onClick={()=>navigate('/appointments')}
          >
            Book an Appointment
          </Button>
        </Box>
      </Box>

      {/* Content Section (Remaining 50%) */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          bgcolor: "white",
          px: 2,
        }}
      >
        
      </Box>

      {/* Floating Circular Chat Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenChat(!openChat)}
        sx={{
          position: "fixed",
          bottom: "45%",
          right: "83%",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: 3,
          transition: "all 0.3s ease",
          "&:hover": { transform: "scale(1.1)" },
        }}
      >
        <ChatIcon fontSize="large" />
      </Button>

      {/* Chat Box */}
      <Slide direction="up" in={openChat} mountOnEnter unmountOnExit>
        <Paper
          elevation={4}
          sx={{
            position: "fixed",
            bottom: "12%",
            right: "5%",
            width: { xs: "90%", sm: "350px" },
            height: { xs: "300px", sm: "400px" },
            bgcolor: "white",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            zIndex: 1001, // Ensure it's above other components
            boxShadow: 4,
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              bgcolor: "primary.main",
              color: "white",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
            }}
          >
            <Typography fontWeight="bold">Support Chat</Typography>
            <IconButton
              size="small"
              onClick={() => setOpenChat(false)}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Chat Body */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              bgcolor: "#f5f5f5",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Hello! How can we assist you today?
            </Typography>
          </Box>

          {/* Chat Input */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #ddd",
              display: "flex",
              gap: 1,
            }}
          >
            <input
              type="text"
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                outline: "none",
                borderRadius: "5px",
              }}
            />
            <Button variant="contained" color="primary">
              Send
            </Button>
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
};

export default HeroSection;