import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
  Fab,
} from "@mui/material";
import { motion } from "framer-motion";
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
  KeyboardArrowUp,
} from "@mui/icons-material";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionFab = motion(Fab);

const AdvancedHospitalFooter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const colors = {
    primary: "#007bff",
    secondary: "#6c757d",
    background: "#f8f9fa",
    text: "#343a40",
    accent: "#28a745",
  };

  const socialIcons = [
    { icon: <Facebook />, link: "#facebook", color: "#3b5998" },
    { icon: <Twitter />, link: "#twitter", color: "#1da1f2" },
    { icon: <Instagram />, link: "#instagram", color: "#c13584" },
    { icon: <LinkedIn />, link: "#linkedin", color: "#0077b5" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        overflow: "hidden",
        color: colors.text,
        py: { xs: 5, md: 10 },
        backgroundColor: colors.background,
      }}
    >
      {/* CSS Animations */}
      <style>{`
        @keyframes pulseGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .pulsingHeader {
          background: linear-gradient(270deg, #007bff, #28a745, #007bff);
          background-size: 600% 600%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: pulseGradient 6s ease infinite;
        }
      `}</style>

      {/* Animated Wave Background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 1440 320"
          style={{ position: "absolute", bottom: 0, width: "100%", height: "100%" }}
        >
          <path
            fill={colors.primary + "33"}
            d="M0,160L48,165.3C96,171,192,181,288,197.3C384,213,480,235,576,234.7C672,235,768,213,864,197.3C960,181,1056,171,1152,165.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          >
            <animate
              attributeName="d"
              dur="12s"
              repeatCount="indefinite"
              values="
                M0,160L48,165.3C96,171,192,181,288,197.3C384,213,480,235,576,234.7C672,235,768,213,864,197.3C960,181,1056,171,1152,165.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,180L48,165.3C96,151,192,121,288,117.3C384,113,480,133,576,144C672,155,768,149,864,138.7C960,128,1056,112,1152,106.7C1248,101,1344,107,1392,112L1440,117.3L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,160L48,165.3C96,171,192,181,288,197.3C384,213,480,235,576,234.7C672,235,768,213,864,197.3C960,181,1056,171,1152,165.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
              "
            />
          </path>
        </svg>
      </Box>

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid
          container
          spacing={4}
          sx={{ flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left" }}
        >
          {/* Branding & Mission */}
          <Grid item xs={12} md={3}>
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              sx={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-start", mb: 2 }}
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
                <LocalHospital sx={{ mr: 2, color: colors.primary, fontSize: 48 }} />
                <Typography variant="h4" sx={{ fontWeight: "bold", color: colors.primary }}>
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
                Innovative medical solutions with compassionate care, leveraging cutting-edge technology to transform healthcare experiences.
              </Typography>
            </MotionBox>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={3}>
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <Typography
                className="pulsingHeader"
                variant="h6"
                sx={{ mb: 3, fontWeight: "bold", textAlign: isMobile ? "center" : "left" }}
              >
                Quick Access
              </Typography>
              {["Emergency Services", "Patient Portal", "Medical Departments", "Book Appointment", "Health Resources"].map(
                (link) => (
                  <Box
                    key={link}
                    component="a"
                    href="#"
                    sx={{
                      display: "block",
                      color: colors.text,
                      textDecoration: "none",
                      mb: 1,
                      transition: "0.3s",
                      "&:hover": { color: colors.primary },
                    }}
                  >
                    {link}
                  </Box>
                )
              )}
            </MotionBox>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={3}>
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography
                className="pulsingHeader"
                variant="h6"
                sx={{ mb: 3, fontWeight: "bold", textAlign: isMobile ? "center" : "left" }}
              >
                Contact Us
              </Typography>
              {[
                { icon: <Phone sx={{ color: colors.primary }} />, text: "(555) 123-4567" },
                { icon: <Email sx={{ color: colors.primary }} />, text: "support@Maams.pro" },
                { icon: <LocationOn sx={{ color: colors.primary }} />, text: "123 Medical Innovation Plaza" },
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
                  <Typography variant="body2" sx={{ ml: 2, color: colors.secondary }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </MotionBox>
          </Grid>

          {/* Social & Newsletter */}
          <Grid item xs={12} md={3}>
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Typography
                className="pulsingHeader"
                variant="h6"
                sx={{ mb: 3, fontWeight: "bold", textAlign: isMobile ? "center" : "left" }}
              >
                Connect
              </Typography>
              <Box sx={{ display: "flex", justifyContent: isMobile ? "center" : "flex-start", mb: 3 }}>
                {socialIcons.map(({ icon, link, color }, index) => (
                  <IconButton
                    key={link}
                    href={link}
                    sx={{
                      color: hoveredIcon === index ? color : colors.secondary,
                      transform: hoveredIcon === index ? "scale(1.3)" : "scale(1)",
                      boxShadow: hoveredIcon === index ? `0 0 15px ${color}77` : "none",
                      mx: 1,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={() => setHoveredIcon(index)}
                    onMouseLeave={() => setHoveredIcon(null)}
                  >
                    {icon}
                  </IconButton>
                ))}
              </Box>

              {/* Newsletter */}
              <MotionPaper
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                elevation={3}
                sx={{ p: 2, borderRadius: 3, backgroundColor: "white" }}
              >
                <Typography variant="body2" sx={{ mb: 2, color: colors.secondary, textAlign: "center" }}>
                  Subscribe to Our Newsletter
                </Typography>
                <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 1 }}>
                  <input
                    placeholder="Enter your email"
                    style={{
                      flex: 1,
                      padding: "12px 15px",
                      border: `1px solid ${colors.secondary}`,
                      borderRadius: "50px",
                      width: "100%",
                      outline: "none",
                    }}
                  />
                  <IconButton
                    sx={{
                      borderRadius: "50%",
                      backgroundColor: colors.primary,
                      color: "white",
                      "&:hover": { backgroundColor: colors.accent, boxShadow: `0 0 15px ${colors.accent}66` },
                    }}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </MotionPaper>
            </MotionBox>
          </Grid>
        </Grid>

        {/* Footer Bottom */}
        <Divider sx={{ my: 4, backgroundColor: colors.secondary + "33" }} />
        <Box sx={{ textAlign: "center", color: colors.secondary, pt: 2, borderTop: `1px solid ${colors.secondary}33` }}>
          <Typography variant="body2">© {new Date().getFullYear()} MAAMS. All Rights Reserved.</Typography>
        </Box>

        {/* Back to Top */}
        <MotionFab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{ position: "fixed", bottom: 30, right: 30, zIndex: 1000 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <KeyboardArrowUp />
        </MotionFab>
      </Container>
    </Box>
  );
};

export default AdvancedHospitalFooter;
