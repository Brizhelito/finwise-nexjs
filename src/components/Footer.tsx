import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <footer
      style={{ backgroundColor: "#2d3748", color: "#fff", padding: "1rem 0" }}
    >
      <Box textAlign="center">
        <Typography variant="body2">
          © 2024 FinWise. Innovando tu futuro financiero.
        </Typography>
      </Box>
    </footer>
  );
};

export default Footer;
