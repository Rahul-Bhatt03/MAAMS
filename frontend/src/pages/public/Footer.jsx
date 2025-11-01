import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
  Fade,
} from "@mui/material";
import {
  LocalHospital,
  Phone,
  Email,
  LocationOn,
  Send,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from "@mui/icons-material";

const AdvancedHospitalFooter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [hoveredIcon, setHoveredIcon] = useState(null);

  // Advanced color palette
  const colors = {
    primary: "#007bff",
    secondary: "#6c757d",
    background: "#f8f9fa",
    text: "#343a40",
    accent: "#28a745",
  };

  // Advanced hover and interaction styles
  const socialIcons = [
    { icon: <Facebook />, link: "#facebook", color: "#3b5998" },
    { icon: <Twitter />, link: "#twitter", color: "#1da1f2" },
    { icon: <Instagram />, link: "#instagram", color: "#c13584" },
    { icon: <LinkedIn />, link: "#linkedin", color: "#0077b5" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: colors.background,
        color: colors.text,
        py: { xs: 3, md: 6 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
          zIndex: 1,
        },
      }}
    >
     <Container > </Container>
     <Container maxWidth="lg">
        <Grid
          container
          spacing={4}
          sx={{
            flexDirection: isMobile ? "column" : "row",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {/* Hospital Branding & Mission */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMobile ? "center" : "flex-start",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <LocalHospital
                  sx={{
                    mr: 2,
                    color: colors.primary,
                    fontSize: 48,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    color: colors.primary,
                  }}
                >
               MAAMS
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  maxWidth: 300,
                  textAlign: isMobile ? "center" : "left",
                  color: colors.secondary,
                }}
              >
                Innovative medical solutions with compassionate care, leveraging
                cutting-edge technology to transform healthcare experiences.
              </Typography>
            </Box>
          </Grid>

          {/* Quick Links & Services */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: "bold",
                color: colors.primary,
                textAlign: isMobile ? "center" : "left",
              }}
            >
              Quick Access
            </Typography>
            {[
              "Emergency Services",
              "Patient Portal",
              "Medical Departments",
              "Book Appointment",
              "Health Resources",
            ].map((link) => (
              <Button
                key={link}
                variant="text"
                fullWidth
                sx={{
                  justifyContent: isMobile ? "center" : "flex-start",
                  color: colors.text,
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: colors.primary,
                    "& .MuiButton-startIcon": {
                      transform: "translateX(5px)",
                    },
                  },
                  transition: "color 0.3s ease",
                }}
              >
                {link}
              </Button>
            ))}
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: "bold",
                color: colors.primary,
                textAlign: isMobile ? "center" : "left",
              }}
            >
              Contact Us
            </Typography>
            {[
              {
                icon: <Phone sx={{ color: colors.primary }} />,
                text: "(555) 123-4567",
              },
              {
                icon: <Email sx={{ color: colors.primary }} />,
                text: "support@Maams.pro",
              },
              {
                icon: <LocationOn sx={{ color: colors.primary }} />,
                text: "123 Medical Innovation Plaza",
              },
            ].map(({ icon, text }) => (
              <Box
                key={text}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isMobile ? "center" : "flex-start",
                  mb: 2,
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "translateX(10px)" },
                }}
              >
                {icon}
                <Typography
                  variant="body2"
                  sx={{ ml: 2, color: colors.secondary }}
                >
                  {text}
                </Typography>
              </Box>
            ))}
          </Grid>

          {/* Social Media & Newsletter */}
          <Grid item xs={12} md={2}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: "bold",
                color: colors.primary,
                textAlign: isMobile ? "center" : "left",
              }}
            >
              Connect
            </Typography>

            {/* Social Icons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: isMobile ? "center" : "flex-start",
                mb: 2,
              }}
            >
              {socialIcons.map(({ icon, link, color }, index) => (
                <IconButton
                  key={link}
                  href={link}
                  sx={{
                    color: hoveredIcon === index ? color : colors.secondary,
                    transition: "all 0.3s ease",
                    transform:
                      hoveredIcon === index ? "scale(1.2)" : "scale(1)",
                    mx: 1,
                  }}
                  onMouseEnter={() => setHoveredIcon(index)}
                  onMouseLeave={() => setHoveredIcon(null)}
                >
                  {icon}
                </IconButton>
              ))}
            </Box>

            {/* Newsletter Signup */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                backgroundColor: "white",
                borderRadius: 2,
                mt: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  color: colors.secondary,
                  textAlign: "center",
                }}
              >
                Subscribe to Our Newsletter
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  placeholder="Enter your email"
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: `1px solid ${colors.secondary}`,
                    borderRadius: "4px",
                    marginRight: "10px",
                  }}
                />
                <IconButton
                  sx={{
                    backgroundColor: colors.primary,
                    color: "white",
                    "&:hover": { backgroundColor: colors.accent },
                  }}
                >
                  <Send />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Footer Bottom */}
        <Divider sx={{ my: 3, backgroundColor: colors.secondary }} />
        <Box
          sx={{
            textAlign: "center",
            color: colors.secondary,
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} MAAMS . All Rights Reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AdvancedHospitalFooter;
